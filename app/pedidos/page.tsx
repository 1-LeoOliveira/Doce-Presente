'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Copy, Check } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BoloCarrinho {
  id: number
  nome: string
  preco: number
  quantidade: number
  tamanho: string
}

interface PedidoCompleto {
  bolos: BoloCarrinho[]
  cliente: {
    nome: string
    telefone: string
    observacoes?: string
  }
  pagamento: string
}

function PedidosContent() {
  const searchParams = useSearchParams()
  const [carrinho, setCarrinho] = useState<BoloCarrinho[]>(() => {
    const carrinhoParam = searchParams.get('carrinho')
    if (carrinhoParam) {
      try {
        const parsedCarrinho = JSON.parse(carrinhoParam)
        return Array.isArray(parsedCarrinho) ? parsedCarrinho : []
      } catch (error) {
        console.error('Erro ao parsear o carrinho:', error)
        return []
      }
    }
    return []
  })

  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    telefone: '',
    observacoes: ''
  })

  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro')
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const chavePix = "cris.lima34@hotmail.com" // Substitua pela sua chave PIX real

  const copiarChavePix = async () => {
    try {
      await navigator.clipboard.writeText(chavePix)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000) // Reset após 2 segundos
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const pedidoCompleto: PedidoCompleto = {
      bolos: carrinho,
      cliente: dadosCliente,
      pagamento: metodoPagamento
    }

    const mensagemWhatsApp = gerarMensagemWhatsApp(pedidoCompleto)
    const telefoneEmpresa = '+5591982690087'
    const linkWhatsApp = `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagemWhatsApp)}`
    
    window.open(linkWhatsApp, '_blank')
  }

  const gerarMensagemWhatsApp = (pedido: PedidoCompleto) => {
    let mensagem = `*Novo Pedido - Doce Presente*\n\n`
    mensagem += `*Nome:* ${pedido.cliente.nome}\n`
    mensagem += `*Telefone:* ${pedido.cliente.telefone}\n\n`
    
    mensagem += `*Itens do Pedido:*\n`
    pedido.bolos.forEach((bolo) => {
      mensagem += `- ${bolo.nome} (${bolo.tamanho}) x${bolo.quantidade}: R$ ${(bolo.preco * bolo.quantidade).toFixed(2)}\n`
    })
    
    mensagem += `\n*Valor Total:* R$ ${pedido.bolos.reduce((total, item) => 
      total + item.preco * item.quantidade, 0).toFixed(2)}\n\n`
    
    mensagem += `*Método de Pagamento:* ${pedido.pagamento.toUpperCase()}\n`
    
    if (pedido.cliente.observacoes) {
      mensagem += `*Observações:* ${pedido.cliente.observacoes}\n`
    }

    return mensagem
  }

  const valorTotal = carrinho.reduce((total, item) =>
    total + item.preco * item.quantidade, 0
  )

  const removerBolo = (index: number) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index)
    setCarrinho(novoCarrinho)
  }

  return (
    <div 
      className="container mx-auto px-4 py-8 min-h-screen flex flex-col" 
      style={{ backgroundColor: '#ffcbdb' }}
    >
      <div className="relative flex items-center justify-between mb-8">
        <Link 
          href="/cardapio" 
          className="flex items-center text-pink-700 hover:text-pink-900"
        >
          <ArrowLeft className="mr-2" /> Voltar ao Cardápio
        </Link>
        <Link 
          href="/" 
          className="flex items-center text-pink-700 hover:text-pink-900"
        >
          <Home className="mr-2" /> Início
        </Link>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-black mb-6">
        Finalizar Pedido
      </h1>
      
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md flex-grow"
      >
        {carrinho.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <h2 className="text-black font-bold mb-2">Bolos no Pedido:</h2>
            {carrinho.map((bolo, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-center bg-pink-50 p-2 rounded mb-2"
              >
                <span className="text-black text-center sm:text-left mb-2 sm:mb-0">
                  {bolo.nome} - {bolo.tamanho}
                  (x{bolo.quantidade})
                  R$ {(bolo.preco * bolo.quantidade).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removerBolo(index)}
                  className="text-red-500 hover:text-red-700 w-full sm:w-auto text-sm"
                >
                  Remover
                </button>
              </div>
            ))}
            <div className="text-right font-bold text-black">
              Total: R$ {valorTotal.toFixed(2)}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-black text-sm">Nome Completo</label>
            <input
              type="text"
              value={dadosCliente.nome}
              onChange={(e) => setDadosCliente({ ...dadosCliente, nome: e.target.value })}
              className="w-full border rounded p-2 text-black bg-white focus:ring-2 focus:ring-pink-300 text-sm"
              required
              placeholder="Digite seu nome"
            />
          </div>
          <div>
            <label className="block mb-2 text-black text-sm">Telefone</label>
            <input
              type="tel"
              value={dadosCliente.telefone}
              onChange={(e) => setDadosCliente({ ...dadosCliente, telefone: e.target.value })}
              className="w-full border rounded p-2 text-black bg-white focus:ring-2 focus:ring-pink-300 text-sm"
              required
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block mb-2 text-black text-sm">Método de Pagamento</label>
            <select
              value={metodoPagamento}
              onChange={(e) => {
                setMetodoPagamento(e.target.value)
                if (e.target.value === 'pix') {
                  setIsQRCodeModalOpen(true)
                }
              }}
              className="w-full border rounded p-2 text-black bg-white focus:ring-2 focus:ring-pink-300 text-sm"
            > 
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          {metodoPagamento === 'pix' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsQRCodeModalOpen(true)}
                className="w-full text-pink-600 underline text-sm mb-2"
              >
                Visualizar QR Code PIX
              </button>
            </div>
          )}

          <div>
            <label className="block mb-2 text-black text-sm">Observações</label>
            <textarea
              value={dadosCliente.observacoes}
              onChange={(e) => setDadosCliente({ ...dadosCliente, observacoes: e.target.value })}
              className="w-full border rounded p-2 text-black bg-white focus:ring-2 focus:ring-pink-300 text-sm"
              rows={4}
              placeholder="Alguma observação especial?"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={carrinho.length === 0}
          className="mt-4 w-full bg-pink-500 text-white py-3 rounded hover:bg-pink-600 
                     disabled:opacity-50 flex items-center justify-center 
                     active:scale-95 transition-transform text-sm md:text-base"
        >
          <FaWhatsapp className="mr-2" /> Enviar Pedido pelo WhatsApp
        </button>
      </form>

      <Dialog open={isQRCodeModalOpen} onOpenChange={setIsQRCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code PIX</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <img
              src="/img/qrpix.png"
              alt="QR Code PIX"
              className="w-64 h-64 object-contain"
            />
            <div className="text-center space-y-2">
              <p className="font-medium">Valor Total: R$ {valorTotal.toFixed(2)}</p>
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-500">
                  Escaneie o QR Code acima ou copie a chave PIX abaixo
                </p>
                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg w-full max-w-xs">
                  <span className="text-sm text-gray-600 truncate">
                    {chavePix}
                  </span>
                  <button
                    type="button"
                    onClick={copiarChavePix}
                    className="flex items-center justify-center p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {copiado ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {copiado && (
                  <span className="text-xs text-green-500">
                    Chave PIX copiada!
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Pedidos() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <PedidosContent />
    </Suspense>
  )
}