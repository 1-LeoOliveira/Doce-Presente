'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import bolos from '../../data/bolos.json'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Home, Plus, Minus, Check } from 'lucide-react'

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

     return (
       <div key={`bolo-${bolo.id}`} className="border rounded-lg overflow-hidden shadow-md bg-pink-50 p-3 md:p-4">
         <Image
           src={bolo.imagem}
           alt={bolo.nome}
           width={400}
           height={300}
           className="w-full h-40 md:h-48 object-cover rounded-t-lg"
         />
         <div className="mt-2 md:mt-4">
           <h2 className="text-lg md:text-xl font-semibold text-pink-700">{bolo.nome}</h2>
           <p className="text-sm md:text-base text-gray-600 mb-2">{bolo.descricao}</p>

           <div className="flex flex-col sm:flex-row justify-between items-center mb-2 space-y-2 sm:space-y-0">
             <span className="text-base md:text-lg font-bold text-pink-600">
               R$ {bolo.preco.toFixed(2)}
             </span>
             <select
               value={itemsQuantidade[key]?.tamanho || '400ml'}
               onChange={(e) => atualizarQuantidade(bolo.id, quantidade, e.target.value)}
               className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
             >
               {bolo.tamanhos?.map((tamanho: string) => (
                 <option key={tamanho} value={tamanho}>{tamanho}</option>
               ))}
             </select>
           </div>

           <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
             <div className="flex items-center border rounded">
               <button
                 onClick={() => decrementarQuantidadeBolo(bolo.id)}
                 className="px-2 py-1 text-pink-600 hover:bg-pink-100 rounded-l"
               >
                 <Minus className="w-4 h-4" />
               </button>
               <span className="px-4 py-1 border-x text-center min-w-[40px]">{quantidade}</span>
               <button
                 onClick={() => incrementarQuantidadeBolo(bolo.id)}
                 className="px-2 py-1 text-pink-600 hover:bg-pink-100 rounded-r"
               >
                 <Plus className="w-4 h-4" />
               </button>
             </div>
             <button
               onClick={() => adicionarBoloAoCarrinho(bolo)}
               className="w-full sm:flex-1 bg-pink-500 text-white py-2 rounded hover:bg-pink-600 text-sm"
             >
               Adicionar ao Carrinho
             </button>
           </div>
         </div>
       </div>
     )
   })
 }

 return (
   <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 bg-[#ffcbdb] min-h-screen">
     {showConfirmation && (
       <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-up">
         <Check className="mr-2" />
         <span>{confirmationItem} adicionado ao carrinho!</span>
       </div>
     )}

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
       <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-pink-600 font-pacifico">
         Bolos de Pote
       </h1>
     </div>

     <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
         {renderBolos()}
       </div>
     </div>
   </div>
 )
}

export default function BolosPote() {
 return (
   <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
     <BolosPoteContent />
   </Suspense>
 )
}