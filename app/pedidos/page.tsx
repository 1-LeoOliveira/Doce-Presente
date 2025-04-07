'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, MapPin, Copy, Check } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ItemCarrinho {
  id: string
  nome: string
  preco: number
  quantidade: number
  tamanho: string | number
  tipo: 'ovo' | 'bolo'
  detalhes?: {
    casca?: number
    recheio?: number
    cascaNome?: string
    recheioNome?: string
    ovosMultiplos?: Array<{
      casca: number
      recheio: number
      cascaNome: string
      recheioNome: string
    }>
  }
}

interface PedidoCompleto {
  itens: ItemCarrinho[]
  cliente: {
    nome: string
    telefone: string
    endereco?: string
    localizacao?: { lat: number; lng: number }
    observacoes?: string
  }
  pagamento: string
}

const paymentMethods = [
  { id: 'dinheiro', name: 'Dinheiro' },
  { id: 'pix', name: 'PIX' },
  { id: 'cartao', name: 'Cartão' }
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(() => {
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
    endereco: '',
    observacoes: ''
  })

  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null)
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro')
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const chavePix = "cris.lima34@hotmail.com" // Substitua pela sua chave PIX real

  const copiarChavePix = async () => {
    try {
      await navigator.clipboard.writeText(chavePix)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const getLocation = () => {
    setIsLoadingLocation(true)
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationError('Seu navegador não suporta geolocalização')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocalizacao({ lat: latitude, lng: longitude })
        setIsLoadingLocation(false)
        setDadosCliente(prev => ({ ...prev, endereco: '' }))
      },
      (err) => {
        setLocationError(`Erro: ${err.message}`)
        setIsLoadingLocation(false)
      },
      { 
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!dadosCliente.nome) {
      alert('Por favor, informe seu nome')
      return
    }

    if (!dadosCliente.telefone) {
      alert('Por favor, informe seu telefone')
      return
    }

    if (!metodoPagamento) {
      alert('Por favor, selecione o método de pagamento')
      return
    }

    if (!dadosCliente.endereco && !localizacao) {
      setLocationError('Por favor, informe o endereço ou compartilhe sua localização')
      return
    }

    const pedidoCompleto: PedidoCompleto = {
      itens: carrinho,
      cliente: {
        ...dadosCliente,
        localizacao: localizacao || undefined
      },
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
    
    if (pedido.cliente.endereco) {
      mensagem += `*Endereço:* ${pedido.cliente.endereco}\n\n`
    }
    
    if (pedido.cliente.localizacao) {
      mensagem += `*Localização Exata:*\n`
      mensagem += `https://www.google.com/maps?q=${pedido.cliente.localizacao.lat},${pedido.cliente.localizacao.lng}\n`
      mensagem += `(Lat: ${pedido.cliente.localizacao.lat}, Lng: ${pedido.cliente.localizacao.lng})\n\n`
    }
    
    mensagem += `*Itens do Pedido:*\n`
    pedido.itens.forEach((item) => {
      if (item.tipo === 'ovo' && item.detalhes?.ovosMultiplos) {
        // Pacote de ovos
        mensagem += `- ${item.nome} (${item.tamanho}g) x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
        item.detalhes.ovosMultiplos.forEach((ovo, index) => {
          mensagem += `  Ovo ${index + 1}: ${ovo.cascaNome} com ${ovo.recheioNome}\n`
        })
      } else if (item.tipo === 'ovo') {
        // Ovo individual
        mensagem += `- ${item.nome} (${item.tamanho}g) x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      } else {
        // Bolo
        mensagem += `- ${item.nome} (${item.tamanho}) x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      }
    })
    
    mensagem += `\n*Valor Total:* R$ ${pedido.itens.reduce((total, item) => 
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

  const removerItem = (index: number) => {
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
            <h2 className="text-black font-bold mb-2">Itens no Pedido:</h2>
            {carrinho.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-center bg-pink-50 p-2 rounded mb-2"
              >
                <span className="text-black text-center sm:text-left mb-2 sm:mb-0">
                  {item.nome} - {typeof item.tamanho === 'string' ? item.tamanho : `${item.tamanho}g`}
                  (x{item.quantidade})
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removerItem(index)}
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
            <label className="block mb-2 text-black text-sm">Nome Completo*</label>
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
            <label className="block mb-2 text-black text-sm">Telefone*</label>
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
            <label className="block mb-2 text-black text-sm">Endereço</label>
            <input
              type="text"
              value={dadosCliente.endereco}
              onChange={(e) => {
                setDadosCliente({ ...dadosCliente, endereco: e.target.value })
                if (e.target.value) setLocalizacao(null)
              }}
              className="w-full border rounded p-2 text-black bg-white focus:ring-2 focus:ring-pink-300 text-sm"
              placeholder="Rua, número, bairro, complemento"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-black text-sm">
              {dadosCliente.endereco ? 'Ou compartilhe sua localização exata' : 'Compartilhe sua localização exata*'}
            </label>
            <button
              type="button"
              onClick={getLocation}
              disabled={isLoadingLocation}
              className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 text-sm ${
                isLoadingLocation 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoadingLocation ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Obtendo localização...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  <span>Compartilhar minha localização exata</span>
                </>
              )}
            </button>
            {locationError && !dadosCliente.endereco && !localizacao && (
              <p className="text-red-500 text-sm mt-1">{locationError}</p>
            )}
            {localizacao && (
              <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-lg">
                ✅ Localização obtida com sucesso
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-black text-sm">Método de Pagamento*</label>
            <select
              value={metodoPagamento}
              onChange={(e) => {
                setMetodoPagamento(e.target.value)
                if (e.target.value === 'pix') {
                  setIsQRCodeModalOpen(true)
                }
              }}
              className="w-full border rounded p-2 text-black bg-white focus:ring-2 focus:ring-pink-300 text-sm"
              required
            > 
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
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

export default function Checkout() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}