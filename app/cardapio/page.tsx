'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import bolos from '../../data/bolos.json'
import salgados from '../../data/salgados.json'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Home, Plus, Minus } from 'lucide-react'

interface ItemCarrinho {
  id: number
  nome: string
  preco: number
  quantidade: number
  tamanho: string
  tipo: 'bolo' | 'salgado'
}

interface Item {
  id: number
  nome: string
  preco: number
  tamanhos?: string[]
  imagem: string
  descricao: string
}

function CardapioContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'bolos' | 'salgados'>('bolos')
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(() => {
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

  const [itemsQuantidade, setItemsQuantidade] = useState<{[key: string]: {quantidade: number, tamanho: string}}>({})

  const atualizarQuantidade = (itemId: number, quantidade: number, tamanho: string, tipo: 'bolo' | 'salgado') => {
    const key = `${tipo}-${itemId}`
    const novaQuantidade = Math.max(1, quantidade)
    setItemsQuantidade(prev => ({
      ...prev,
      [key]: { quantidade: novaQuantidade, tamanho }
    }))
  }

  const incrementarQuantidade = (itemId: number, tipo: 'bolo' | 'salgado') => {
    const key = `${tipo}-${itemId}`
    const atual = itemsQuantidade[key]?.quantidade || 1
    atualizarQuantidade(
      itemId,
      atual + 1,
      itemsQuantidade[key]?.tamanho || (tipo === 'bolo' ? '400ml' : 'Unidade'),
      tipo
    )
  }

  const decrementarQuantidade = (itemId: number, tipo: 'bolo' | 'salgado') => {
    const key = `${tipo}-${itemId}`
    const atual = itemsQuantidade[key]?.quantidade || 1
    if (atual > 1) {
      atualizarQuantidade(
        itemId,
        atual - 1,
        itemsQuantidade[key]?.tamanho || (tipo === 'bolo' ? '400ml' : 'Unidade'),
        tipo
      )
    }
  }

  const adicionarAoCarrinho = (item: Item, tipo: 'bolo' | 'salgado') => {
    const key = `${tipo}-${item.id}`
    const detalhes = itemsQuantidade[key] || { 
      quantidade: 1, 
      tamanho: tipo === 'bolo' ? '400ml' : 'Unidade'
    }

    const itemNoCarrinho: ItemCarrinho = {
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      quantidade: detalhes.quantidade,
      tamanho: detalhes.tamanho,
      tipo
    }

    const carrinhoAtualizado = [...carrinho]
    const indiceExistente = carrinhoAtualizado.findIndex(i => 
      i.id === itemNoCarrinho.id && 
      i.tipo === tipo
    )

    if (indiceExistente > -1) {
      carrinhoAtualizado[indiceExistente].quantidade += itemNoCarrinho.quantidade
    } else {
      carrinhoAtualizado.push(itemNoCarrinho)
    }

    setCarrinho(carrinhoAtualizado)
    atualizarQuantidade(item.id, 1, detalhes.tamanho, tipo)
  }

  const valorTotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0)

  const renderItems = () => {
    const items = activeTab === 'bolos' ? bolos : salgados.salgados
    
    return items.map((item) => (
      <div 
        key={`${activeTab}-${item.id}`} 
        className="border rounded-lg overflow-hidden shadow-md bg-pink-50 p-3 md:p-4"
      >
        <Image 
          src={item.imagem} 
          alt={item.nome}
          width={400}
          height={300}
          className="w-full h-40 md:h-48 object-cover rounded-t-lg"
        />
        <div className="mt-2 md:mt-4">
          <h2 className="text-lg md:text-xl font-semibold text-pink-700">
            {item.nome}
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-2">{item.descricao}</p>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 space-y-2 sm:space-y-0">
            <span className="text-base md:text-lg font-bold text-pink-600">
              R$ {item.preco.toFixed(2)}
              {activeTab === 'salgados' && ' / unidade'}
            </span>
            {activeTab === 'bolos' && (
              <select 
                value={itemsQuantidade[`${activeTab}-${item.id}`]?.tamanho || '400ml'}
                onChange={(e) => {
                  atualizarQuantidade(
                    item.id,
                    itemsQuantidade[`${activeTab}-${item.id}`]?.quantidade || 1,
                    e.target.value,
                    'bolo'
                  )
                }}
                className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
              >
                {item.tamanhos && item.tamanhos.map(tamanho => (
                  <option key={tamanho} value={tamanho}>
                    {tamanho}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center border rounded">
              <button
                onClick={() => decrementarQuantidade(item.id, activeTab === 'bolos' ? 'bolo' : 'salgado')}
                className="px-2 py-1 text-pink-600 hover:bg-pink-100 rounded-l"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 border-x text-center min-w-[40px]">
                {itemsQuantidade[`${activeTab}-${item.id}`]?.quantidade || 1}
              </span>
              <button
                onClick={() => incrementarQuantidade(item.id, activeTab === 'bolos' ? 'bolo' : 'salgado')}
                className="px-2 py-1 text-pink-600 hover:bg-pink-100 rounded-r"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => adicionarAoCarrinho(item, activeTab === 'bolos' ? 'bolo' : 'salgado')}
              className="w-full sm:flex-1 bg-pink-500 text-white py-2 rounded hover:bg-pink-600 text-sm"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 bg-[#ffcbdb] min-h-screen">
      {carrinho.length > 0 && (
        <Link 
          href={{
            pathname: '/pedidos',
            query: { carrinho: JSON.stringify(carrinho) }
          }}
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 bg-pink-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-pink-600 flex items-center text-sm md:text-base"
        >
          <ShoppingCart className="mr-1 md:mr-2 w-4 h-4 md:w-6 md:h-6" />
          {carrinho.length} | R$ {valorTotal.toFixed(2)}
        </Link>
      )}

      <div className="relative flex flex-col items-center justify-center mb-4">
        <Link 
          href="/" 
          className="self-start w-full max-w-xs flex items-center text-pink-700 hover:text-pink-900 mb-2"
        >
          <Home className="mr-2" /> Início
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-pink-600">
          Nosso Cardápio
        </h1>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('bolos')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'bolos'
                ? 'bg-pink-500 text-white'
                : 'bg-pink-200 text-pink-700 hover:bg-pink-300'
            }`}
          >
            Bolos de Pote
          </button>
          <button
            onClick={() => setActiveTab('salgados')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'salgados'
                ? 'bg-pink-500 text-white'
                : 'bg-pink-200 text-pink-700 hover:bg-pink-300'
            }`}
          >
            Salgados
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {renderItems()}
        </div>
      </div>
    </div>
  )
}

export default function Cardapio() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <CardapioContent />
    </Suspense>
  )
}