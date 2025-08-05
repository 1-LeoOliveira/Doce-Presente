import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Star, Heart, Clock, ChefHat } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-rose-200/30 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-300/20 rounded-full blur-lg"></div>

      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl relative border border-white/20">
          
          {/* Instagram Link */}
          <div className="absolute top-6 right-6">
            <Link 
              href="https://www.instagram.com/docepresente18" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative"
              aria-label="Instagram"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full text-white hover:scale-110 transition-all duration-300 shadow-lg">
                <Instagram size={24} />
              </div>
            </Link>
          </div>

          {/* Logo com efeito especial */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-2xl opacity-20 scale-110"></div>
            <div className="relative">
              <Image 
                src="/img/Logo.png" 
                alt="Doce Presente" 
                width={200} 
                height={200} 
                className="mx-auto rounded-full w-40 md:w-56 h-40 md:h-56 object-cover shadow-2xl border-4 border-white/50 hover:scale-105 transition-transform duration-500"
              />
              {/* Badge flutuante */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                Disponível
              </div>
            </div>
          </div>

          {/* Título principal */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent">
              Doce Presente
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-medium mb-2">
              Carinho em forma de sabor
            </p>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Bolos de pote artesanais feitos com ingredientes selecionados e muito amor
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">4.9</p>
              <p className="text-xs text-gray-600">Avaliação</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">100%</p>
              <p className="text-xs text-gray-600">Satisfação</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100">
              <div className="flex items-center justify-center mb-2">
                <ChefHat className="w-6 h-6 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">15+</p>
              <p className="text-xs text-gray-600">Sabores</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">2-4h</p>
              <p className="text-xs text-gray-600">Entrega</p>
            </div>
          </div>

          {/* Destaques */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                🏆 Mais Vendidos
              </span>
              <span className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✨ Receitas Exclusivas
              </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                🥇 Ingredientes Premium
              </span>
            </div>
          </div>
          
          {/* Botão principal */}
          <div className="flex justify-center">
            <Link 
              href="/cardapio" 
              className="group relative overflow-hidden"
            >
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              {/* Botão principal */}
              <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white px-8 py-4 md:px-12 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <span>Ver Cardápio</span>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              </div>
              
              {/* Efeito shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 rounded-2xl"></div>
            </Link>
          </div>

          {/* Texto adicional */}
          <p className="text-sm text-gray-500 mt-6 max-w-sm mx-auto">
            Clique no botão acima para descobrir nossos deliciosos sabores e fazer seu pedido
          </p>

          {/* Elementos decorativos */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full opacity-40"></div>
          <div className="absolute top-1/4 -left-6 w-6 h-6 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Efeito de partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-rose-400 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-pink-300 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-rose-300 rounded-full animate-ping opacity-60"></div>
      </div>
    </div>
  )
}