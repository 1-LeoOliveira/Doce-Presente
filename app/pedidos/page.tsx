'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Copy, Check, Trash2, MapPin, CreditCard, Banknote, Smartphone } from 'lucide-react'
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
  { id: 'dinheiro', name: 'Dinheiro', icon: Banknote, color: 'from-green-500 to-emerald-500' },
  { id: 'pix', name: 'PIX', icon: Smartphone, color: 'from-blue-500 to-cyan-500' },
  { id: 'cartao', name: 'Cartão', icon: CreditCard, color: 'from-purple-500 to-violet-500' }
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('carrinhoPascoa')
      if (savedCart) {
        try {
          return JSON.parse(savedCart)
        } catch (error) {
          console.error('Erro ao parsear o carrinho do localStorage:', error)
        }
      }
    }

    const carrinhoParam = searchParams.get('carrinho')
    if (carrinhoParam) {
      try {
        return JSON.parse(carrinhoParam)
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
  const chavePix = "cris.lima34@hotmail.com"

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carrinhoPascoa', JSON.stringify(carrinho))
    }
  }, [carrinho])

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
    const telefoneEmpresa = '+5591982170128'
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
        mensagem += `- ${item.nome} x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
        item.detalhes.ovosMultiplos.forEach((ovo, index) => {
          mensagem += `  → Ovo ${index + 1}: Casca ${ovo.cascaNome} com Recheio ${ovo.recheioNome}\n`
        })
      } else if (item.tipo === 'ovo') {
        mensagem += `- ${item.nome} x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
        if (item.detalhes?.cascaNome && item.detalhes?.recheioNome) {
          mensagem += `  → Casca: ${item.detalhes.cascaNome}\n`
          mensagem += `  → Recheio: ${item.detalhes.recheioNome}\n`
        }
      } else {
        mensagem += `- ${item.nome} x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      }
    })
  
    mensagem += `\n*Valor Total:* R$ ${pedido.itens.reduce((total, item) => 
      total + item.preco * item.quantidade, 0).toFixed(2)}\n\n`
  
    mensagem += `*Método de Pagamento:* ${paymentMethods.find(m => m.id === pedido.pagamento)?.name || pedido.pagamento.toUpperCase()}\n`
  
    if (pedido.cliente.observacoes) {
      mensagem += `*Observações:* ${pedido.cliente.observacoes}\n`
    }
  
    return mensagem
  }

  const valorTotal = carrinho.reduce((total, item) =>
    total + item.preco * item.quantidade, 0
  )

  const removerItem = (itemId: string) => {
    const novoCarrinho = carrinho.filter(item => item.id !== itemId)
    setCarrinho(novoCarrinho)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={{
                pathname: "/cardapio",
                query: { carrinho: JSON.stringify(carrinho) }
              }}
              className="inline-flex items-center text-white/90 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="mr-2 w-5 h-5" /> 
              <span className="font-medium">Voltar ao Cardápio</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center text-white/90 hover:text-white transition-colors duration-300"
            >
              <Home className="mr-2 w-5 h-5" /> 
              <span className="font-medium">Início</span>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
              Finalizar Pedido
            </h1>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto leading-relaxed">
              Últimos passos para receber suas delícias em casa
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {carrinho.length > 0 ? (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Pedido */}
            <div className="bg-white rounded-2xl shadow-xl p-6 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-pink-600 font-bold">1</span>
                </div>
                Resumo do Pedido
              </h2>
              
              <div className="space-y-4 mb-6">
                {carrinho.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">{item.nome}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="bg-white px-2 py-1 rounded-lg font-medium">
                            {typeof item.tamanho === 'string' ? item.tamanho : `${item.tamanho}g`}
                          </span>
                          <span className="bg-white px-2 py-1 rounded-lg font-medium">
                            Qtd: {item.quantidade}
                          </span>
                        </div>
                        
                        {item.tipo === 'ovo' && item.detalhes?.ovosMultiplos && (
                          <div className="mt-2 p-3 bg-white rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Sabores:</p>
                            <ul className="space-y-1">
                              {item.detalhes.ovosMultiplos.map((ovo, idx) => (
                                <li key={idx} className="text-xs text-gray-600 flex items-center">
                                  <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                                  Ovo {idx + 1}: {ovo.cascaNome} com {ovo.recheioNome}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.tipo === 'ovo' && item.detalhes?.cascaNome && !item.detalhes?.ovosMultiplos && (
                          <p className="text-sm text-gray-600 bg-white px-2 py-1 rounded-lg inline-block">
                            {item.detalhes.cascaNome} com {item.detalhes.recheioNome}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end ml-4">
                        <span className="font-bold text-lg bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                          R$ {(item.preco * item.quantidade).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removerItem(item.id)}
                          className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-300 opacity-0 group-hover:opacity-100"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl text-white">
                  <span className="text-lg font-semibold">Total do Pedido</span>
                  <span className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-pink-600 font-bold">2</span>
                </div>
                Dados de Entrega
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={dadosCliente.nome}
                    onChange={(e) => setDadosCliente({ ...dadosCliente, nome: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all duration-300 hover:bg-white"
                    required
                    placeholder="Digite seu nome completo"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={dadosCliente.telefone}
                    onChange={(e) => setDadosCliente({ ...dadosCliente, telefone: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all duration-300 hover:bg-white"
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Endereço */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={dadosCliente.endereco}
                    onChange={(e) => {
                      setDadosCliente({ ...dadosCliente, endereco: e.target.value })
                      if (e.target.value) setLocalizacao(null)
                    }}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all duration-300 hover:bg-white"
                    placeholder="Rua, número, bairro, complemento"
                  />
                </div>
                
                {/* Localização */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {dadosCliente.endereco ? 'Ou compartilhe sua localização exata' : 'Compartilhe sua localização exata *'}
                  </label>
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={isLoadingLocation}
                    className={`w-full p-4 rounded-xl flex items-center justify-center space-x-3 font-medium transition-all duration-300 ${
                      isLoadingLocation 
                        ? 'bg-blue-400 cursor-not-allowed text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
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
                    <p className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      {locationError}
                    </p>
                  )}
                  
                  {localizacao && (
                    <div className="mt-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      <span className="font-medium">Localização obtida com sucesso!</span>
                    </div>
                  )}
                </div>

                {/* Método de Pagamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Método de Pagamento *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setMetodoPagamento(method.id)
                            if (method.id === 'pix') {
                              setIsQRCodeModalOpen(true)
                            }
                          }}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                            metodoPagamento === method.id
                              ? 'border-pink-500 bg-pink-50 shadow-lg transform scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${method.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">{method.name}</span>
                          {metodoPagamento === method.id && (
                            <div className="ml-auto">
                              <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  
                  {metodoPagamento === 'pix' && (
                    <button
                      type="button"
                      onClick={() => setIsQRCodeModalOpen(true)}
                      className="mt-3 w-full text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
                    >
                      👆 Clique para visualizar QR Code PIX
                    </button>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={dadosCliente.observacoes}
                    onChange={(e) => setDadosCliente({ ...dadosCliente, observacoes: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all duration-300 hover:bg-white resize-none"
                    rows={4}
                    placeholder="Alguma observação especial sobre seu pedido?"
                  />
                </div>

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={carrinho.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FaWhatsapp className="w-6 h-6" />
                  <span>Enviar Pedido pelo WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Carrinho Vazio</h2>
            <p className="text-gray-600 mb-6">Adicione alguns deliciosos bolos de pote ao seu carrinho!</p>
            <Link
              href="/cardapio"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Ver Cardápio
            </Link>
          </div>
        )}
      </div>

      {/* Modal PIX */}
      <Dialog open={isQRCodeModalOpen} onOpenChange={setIsQRCodeModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
              Pagamento PIX
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 p-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl">
              <Image
                src="/img/qrpix.png"
                alt="QR Code PIX"
                width={256}
                height={256}
                className="object-contain rounded-xl"
              />
            </div>
            
            <div className="text-center space-y-4 w-full">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl">
                <p className="font-bold text-lg">Valor Total: R$ {valorTotal.toFixed(2)}</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">
                  Escaneie o QR Code acima ou copie a chave PIX abaixo:
                </p>
                
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                  <span className="text-sm text-gray-700 font-mono flex-1 truncate">
                    {chavePix}
                  </span>
                  <button
                    type="button"
                    onClick={copiarChavePix}
                    className="flex items-center justify-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-300 bg-white shadow-sm"
                  >
                    {copiado ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                
                {copiado && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Chave PIX copiada com sucesso!</span>
                  </div>
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
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}