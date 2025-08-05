'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import bolos from '../../data/bolos.json'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Home, Plus, Minus, Check, Star, Heart, Clock } from 'lucide-react'

interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  tamanho: string | number;
  tipo: 'ovo' | 'bolo';
  detalhes?: {
    casca?: number;
    recheio?: number;
    cascaNome?: string;
    recheioNome?: string;
    ovosMultiplos?: Array<{
      casca: number;
      recheio: number;
      cascaNome: string;
      recheioNome: string;
    }>;
  };
}

interface Bolo {
  id: number;
  nome: string;
  descricao: string;
  imagem: string;
  preco: number;
  tamanhos?: string[];
}

function BolosPoteContent() {
  const searchParams = useSearchParams()
  const [itemsQuantidade, setItemsQuantidade] = useState<{ [key: string]: { quantidade: number, tamanho: string } }>({})
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [confirmationItem, setConfirmationItem] = useState<string>('')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carrinhoPascoa', JSON.stringify(carrinho))
    }
  }, [carrinho])

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfirmation])

  const mostrarConfirmacao = (itemNome: string) => {
    setConfirmationItem(itemNome)
    setShowConfirmation(true)
  }

  const toggleFavorite = (boloId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(boloId)) {
        newFavorites.delete(boloId)
      } else {
        newFavorites.add(boloId)
      }
      return newFavorites
    })
  }

  const getItemKey = (itemId: number) => `bolo-${itemId}`

  const getInitialQuantidade = (itemId: number) => {
    const key = getItemKey(itemId)
    return itemsQuantidade[key]?.quantidade || 1
  }

  const atualizarQuantidade = (itemId: number, novaQuantidade: number, tamanho: string) => {
    const key = getItemKey(itemId)
    if (novaQuantidade >= 1) {
      setItemsQuantidade(prev => ({
        ...prev,
        [key]: { quantidade: novaQuantidade, tamanho }
      }))
    }
  }

  const incrementarQuantidadeBolo = (itemId: number) => {
    const key = getItemKey(itemId)
    const quantidadeAtual = getInitialQuantidade(itemId)
    const tamanhoAtual = itemsQuantidade[key]?.tamanho || '400ml'
    atualizarQuantidade(itemId, quantidadeAtual + 1, tamanhoAtual)
  }

  const decrementarQuantidadeBolo = (itemId: number) => {
    const key = getItemKey(itemId)
    const quantidadeAtual = getInitialQuantidade(itemId)
    if (quantidadeAtual > 1) {
      const tamanhoAtual = itemsQuantidade[key]?.tamanho || '400ml'
      atualizarQuantidade(itemId, quantidadeAtual - 1, tamanhoAtual)
    }
  }

  const adicionarBoloAoCarrinho = (bolo: Bolo) => {
    const key = getItemKey(bolo.id)
    const detalhes = itemsQuantidade[key] || {
      quantidade: 1,
      tamanho: '400ml'
    }

    const itemNoCarrinho: ItemCarrinho = {
      id: `bolo-${bolo.id}-${detalhes.tamanho}`,
      nome: bolo.nome,
      preco: bolo.preco,
      quantidade: detalhes.quantidade,
      tamanho: detalhes.tamanho,
      tipo: 'bolo'
    }

    const carrinhoAtualizado = [...carrinho]
    const indiceExistente = carrinhoAtualizado.findIndex(i =>
      i.id === itemNoCarrinho.id &&
      i.tipo === 'bolo' &&
      i.tamanho === itemNoCarrinho.tamanho
    )

    if (indiceExistente > -1) {
      carrinhoAtualizado[indiceExistente].quantidade += itemNoCarrinho.quantidade
    } else {
      carrinhoAtualizado.push(itemNoCarrinho)
    }

    setCarrinho(carrinhoAtualizado)
    atualizarQuantidade(bolo.id, 1, detalhes.tamanho)
    mostrarConfirmacao(bolo.nome)
  }

  const valorTotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0)

  const renderBolos = () => {
    return bolos.map((bolo: Bolo) => {
      const key = getItemKey(bolo.id)
      const quantidade = getInitialQuantidade(bolo.id)
      const isFavorite = favorites.has(bolo.id)

      return (
        <div key={`bolo-${bolo.id}`} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
          {/* Badge de destaque */}
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Disponível
          </div>
          
          {/* Botão de favorito */}
          <button
            onClick={() => toggleFavorite(bolo.id)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-300"
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
              }`} 
            />
          </button>

          {/* Imagem com overlay gradient */}
          <div className="relative overflow-hidden">
            <Image
              src={bolo.imagem}
              alt={bolo.nome}
              width={400}
              height={300}
              className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Conteúdo do card */}
          <div className="p-6">
            {/* Header do produto */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors duration-300">
                {bolo.nome}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {bolo.descricao}
              </p>
            </div>

            {/* Rating fictício para parecer mais profissional */}
            <div className="flex items-center mb-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">(4.9)</span>
            </div>

            {/* Preço e seletor de tamanho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                R$ {bolo.preco.toFixed(2)}
              </div>
              <select
                value={itemsQuantidade[key]?.tamanho || '400ml'}
                onChange={(e) => atualizarQuantidade(bolo.id, quantidade, e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
              >
                {bolo.tamanhos?.map((tamanho: string) => (
                  <option key={tamanho} value={tamanho}>{tamanho}</option>
                ))}
              </select>
            </div>

            {/* Controles de quantidade e botão de adicionar */}
            <div className="flex flex-col sm:flex-row items-stretch space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => decrementarQuantidadeBolo(bolo.id)}
                  className="px-4 py-3 text-pink-600 hover:bg-pink-50 transition-colors duration-300 font-semibold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-bold text-gray-800 min-w-[60px] text-center bg-white border-x-2 border-gray-200">
                  {quantidade}
                </span>
                <button
                  onClick={() => incrementarQuantidadeBolo(bolo.id)}
                  className="px-4 py-3 text-pink-600 hover:bg-pink-50 transition-colors duration-300 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => adicionarBoloAoCarrinho(bolo)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors duration-300"
          >
            <Home className="mr-2 w-5 h-5" /> 
            <span className="font-medium">Voltar ao Início</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
              Bolos de Pote Artesanais
            </h1>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto leading-relaxed">
              Sabores únicos, feitos com amor e ingredientes selecionados especialmente para você
            </p>
          </div>
        </div>
      </div>

      {/* Seção de estatísticas */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avaliação</p>
                <p className="font-bold text-gray-800">4.9/5.0</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="font-bold text-gray-800">100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {renderBolos()}
        </div>
      </div>

      {/* Notificação de confirmação */}
      {showConfirmation && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Adicionado com sucesso!</p>
              <p className="text-sm text-green-100">{confirmationItem}</p>
            </div>
          </div>
        </div>
      )}

      {/* Carrinho flutuante */}
      {carrinho.length > 0 && (
        <Link
          href={{
            pathname: '/pedidos',
            query: { carrinho: JSON.stringify(carrinho) }
          }}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                {carrinho.length}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold">Ver Carrinho</p>
              <p className="text-sm text-pink-100">R$ {valorTotal.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Efeito de pulso */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl animate-ping opacity-20"></div>
        </Link>
      )}
    </div>
  )
}

export default function BolosPote() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando delícias...</p>
        </div>
      </div>
    }>
      <BolosPoteContent />
    </Suspense>
  )
}