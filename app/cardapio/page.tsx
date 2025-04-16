'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ovos from '../../data/ovos.json'
import bolos from '../../data/bolos.json'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Home, Plus, Minus, X, Check } from 'lucide-react'

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

interface TamanhoOvo {
  id: number;
  nome: string;
  tipo: string;
  gramas?: number;
  preco: number;
  imagem: string;
  descricao: string;
}

interface PacoteOvos {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
  quantidade: number;
  gramasIndividual?: number;
  gramasTotal?: number;
  preco: number;
  imagem: string;
}

type Tamanho = TamanhoOvo | PacoteOvos;

function OvosPascoaContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'ovos' | 'bolos'>('ovos')
  const [selectedCasca, setSelectedCasca] = useState<number>(1)
  const [selectedRecheio, setSelectedRecheio] = useState<number>(1)
  const [selectedTamanho, setSelectedTamanho] = useState<number>(1)
  const [quantidade, setQuantidade] = useState<number>(1)
  const [itemsQuantidade, setItemsQuantidade] = useState<{ [key: string]: { quantidade: number, tamanho: string } }>({})
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [confirmationItem, setConfirmationItem] = useState<string>('')
  const [opcaoKit, setOpcaoKit] = useState<'mini' | 'grande'>('mini')

  const [multiplosOvos, setMultiplosOvos] = useState<Array<{ casca: number, recheio: number }>>([])
  const [etapaSelecao, setEtapaSelecao] = useState<number>(0)

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

  const encontrarCasca = (id = selectedCasca) => {
    return ovos?.cascas?.find(casca => casca.id === id) || {
      id: 0,
      nome: "Casca não especificada",
      descricao: ""
    }
  }

  const encontrarRecheio = (id = selectedRecheio) => {
    return ovos?.recheios?.find(recheio => recheio.id === id) || {
      id: 0,
      nome: "Recheio não especificado",
      descricao: ""
    }
  }

  const encontrarTamanho = (id = selectedTamanho): Tamanho => {
    const tamanhoIndividual = ovos?.tamanhos?.find(t => t.id === id);
    if (tamanhoIndividual) return tamanhoIndividual;

    const pacote = ovos?.pacotes?.find(p => p.id === id);
    if (pacote) return pacote;

    return {
      id: 0,
      nome: "Produto não encontrado",
      tipo: "indefinido",
      preco: 0,
      imagem: "/images/ovos/padrao.jpg"
    };
  }

  const encontrarOvoImagem = () => {
    const tamanho = encontrarTamanho()
    return tamanho.imagem
  }

  const inicializarMultiplosOvos = (pacoteId: number) => {
    const pacote = ovos.pacotes.find(p => p.id === pacoteId)
    if (!pacote) return

    // Caso especial para o Kit Confeiteiro
    if (pacoteId === 9) {
      if (opcaoKit === 'mini') {
        // 5 mini ovos com 2 recheios diferentes
        setMultiplosOvos([
          { casca: 1, recheio: 1 },
          { casca: 1, recheio: 1 },
          { casca: 1, recheio: 1 },
          { casca: 1, recheio: 1 },
          { casca: 1, recheio: 1 }
        ])
      } else {
        // 1 ovo grande
        setMultiplosOvos([{ casca: 1, recheio: 1 }])
      }
    } else {
      // Outros pacotes - comportamento normal
      const novosOvos = []
      for (let i = 0; i < pacote.quantidade; i++) {
        novosOvos.push({
          casca: 1,
          recheio: 1
        })
      }
      setMultiplosOvos(novosOvos)
    }

    setEtapaSelecao(1)
  }

  const incrementarQuantidade = () => {
    setQuantidade(prev => prev + 1)
  }

  const decrementarQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(prev => prev - 1)
    }
  }

  const precoTotal = () => {
    const tamanho = encontrarTamanho()
    return tamanho.preco * quantidade
  }

  const atualizarOvoNoIndice = (index: number, campo: 'casca' | 'recheio', valor: number) => {
    if (index < 0 || index >= multiplosOvos.length) return

    const ovosAtualizados = [...multiplosOvos]
    ovosAtualizados[index] = {
      ...ovosAtualizados[index],
      [campo]: valor
    }

    setMultiplosOvos(ovosAtualizados)
  }

  const proximaEtapa = () => {
    if (etapaSelecao < multiplosOvos.length) {
      setEtapaSelecao(etapaSelecao + 1)
    }
  }

  const etapaAnterior = () => {
    if (etapaSelecao > 1) {
      setEtapaSelecao(etapaSelecao - 1)
    } else {
      setEtapaSelecao(0)
      setMultiplosOvos([])
    }
  }

  // Funções para manipulação de bolos
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

  const adicionarOvoAoCarrinho = () => {
    const tamanho = encontrarTamanho()
    const isPacote = 'quantidade' in tamanho;

    if (isPacote && multiplosOvos.length > 0) {
      const ovosDetalhados = multiplosOvos.map(ovo => {
        const cascaInfo = encontrarCasca(ovo.casca)
        const recheioInfo = encontrarRecheio(ovo.recheio)
        return {
          casca: ovo.casca,
          recheio: ovo.recheio,
          cascaNome: cascaInfo.nome,
          recheioNome: recheioInfo.nome
        }
      })

      const itemId = `pacote-ovos-${selectedTamanho}-${Date.now()}`
      const nomeItem = `${tamanho.nome} - ${tamanho.descricao}`

      const novoItem: ItemCarrinho = {
        id: itemId,
        nome: nomeItem,
        preco: tamanho.preco,
        quantidade: quantidade,
        tamanho: 'gramasTotal' in tamanho ? tamanho.gramasTotal : 0,
        tipo: 'ovo',
        detalhes: {
          ovosMultiplos: ovosDetalhados
        }
      }

      setCarrinho([...carrinho, novoItem])
      setEtapaSelecao(0)
      setMultiplosOvos([])
      setQuantidade(1)
      mostrarConfirmacao(nomeItem)
    } else {
      const casca = encontrarCasca()
      const recheio = encontrarRecheio()

      const itemId = `ovo-${selectedCasca}-${selectedRecheio}-${selectedTamanho}`
      const nomeItem = `Ovo de Páscoa ${casca.nome} com ${recheio.nome} (${tamanho.nome})`

      const novoItem: ItemCarrinho = {
        id: itemId,
        nome: nomeItem,
        preco: tamanho.preco,
        quantidade: quantidade,
        tamanho: 'gramas' in tamanho ? tamanho.gramas : tamanho.nome,
        tipo: 'ovo',
        detalhes: {
          casca: selectedCasca,
          recheio: selectedRecheio,
          cascaNome: casca.nome,
          recheioNome: recheio.nome
        }
      }

      const carrinhoAtualizado = [...carrinho]
      const indiceExistente = carrinhoAtualizado.findIndex(i => i.id === itemId)

      if (indiceExistente > -1) {
        carrinhoAtualizado[indiceExistente].quantidade += quantidade
      } else {
        carrinhoAtualizado.push(novoItem)
      }

      setCarrinho(carrinhoAtualizado)
      setQuantidade(1)
      mostrarConfirmacao(nomeItem)
    }
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

  const renderSelecaoMultiplosOvos = () => {
    const ovoAtual = etapaSelecao > 0 && etapaSelecao <= multiplosOvos.length
      ? multiplosOvos[etapaSelecao - 1]
      : null

    const pacote = ovos.pacotes.find(p => p.id === selectedTamanho)

    if (!ovoAtual || !pacote) return null

    const isKitConfeiteiro = pacote.id === 9
    const maxRecheios = isKitConfeiteiro && opcaoKit === 'mini' ? 2 : Infinity
    const recheiosUsados = new Set(multiplosOvos.map(ovo => ovo.recheio))

    return (
      <div className="bg-pink-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-pink-600">
            {isKitConfeiteiro && opcaoKit === 'mini' ? (
              `Escolha os sabores para o Ovo ${etapaSelecao}/5 (máximo 2 recheios diferentes)`
            ) : (
              `Escolha os sabores para o Ovo ${etapaSelecao}/${pacote.quantidade}`
            )}
          </h2>
          <button
            onClick={etapaAnterior}
            className="text-pink-600 hover:text-pink-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-full max-w-xs relative">
            <Image
              src={encontrarOvoImagem()}
              alt={`Ovo ${etapaSelecao}`}
              width={400}
              height={400}
              className="w-full rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-pink-500 bg-opacity-80 text-white p-2 rounded-b-lg">
              <p className="text-center font-semibold">
                {encontrarCasca(ovoAtual.casca).nome} com {encontrarRecheio(ovoAtual.recheio).nome}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pink-600 mb-2">Casca:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ovos.cascas.map(casca => (
              <div
                key={casca.id}
                className={`border p-2 rounded-lg cursor-pointer transition ${ovoAtual.casca === casca.id ? 'border-pink-500 bg-pink-100' : 'border-gray-200 hover:border-pink-300'
                  }`}
                onClick={() => atualizarOvoNoIndice(etapaSelecao - 1, 'casca', casca.id)}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${ovoAtual.casca === casca.id ? 'bg-pink-500' : 'border border-gray-300'}`}></div>
                  <span>{casca.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pink-600 mb-2">Recheio:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ovos.recheios.map(recheio => {
              const jaUsado = recheiosUsados.has(recheio.id)
              const podeSelecionar = !jaUsado || ovoAtual.recheio === recheio.id
              const ativo = ovoAtual.recheio === recheio.id
              const desativado = !podeSelecionar && recheiosUsados.size >= maxRecheios

              return (
                <div
                  key={recheio.id}
                  className={`border p-2 rounded-lg cursor-pointer transition ${ativo ? 'border-pink-500 bg-pink-100' :
                      desativado ? 'opacity-50 cursor-not-allowed' :
                        'border-gray-200 hover:border-pink-300'
                    }`}
                  onClick={() => !desativado && atualizarOvoNoIndice(etapaSelecao - 1, 'recheio', recheio.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${ativo ? 'bg-pink-500' :
                        desativado ? 'border border-gray-300 bg-gray-100' :
                          'border border-gray-300'
                      }`}></div>
                    <span>{recheio.nome}</span>
                    {jaUsado && ovoAtual.recheio !== recheio.id && (
                      <span className="ml-2 text-xs text-gray-500">(já selecionado)</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {etapaSelecao < multiplosOvos.length ? (
            <button
              onClick={proximaEtapa}
              className="bg-pink-500 text-white py-2 px-6 rounded-lg hover:bg-pink-600"
            >
              Próximo Ovo
            </button>
          ) : (
            <button
              onClick={adicionarOvoAoCarrinho}
              className="bg-pink-500 text-white py-2 px-6 rounded-lg hover:bg-pink-600"
            >
              Adicionar ao Carrinho
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (activeTab === 'ovos') {
      if (etapaSelecao > 0) {
        return renderSelecaoMultiplosOvos()
      }

      const casca = encontrarCasca()
      const recheio = encontrarRecheio()
      const tamanho = encontrarTamanho()
      const isPacote = 'quantidade' in tamanho
      const isKitConfeiteiro = tamanho.id === 9

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-full max-w-xs relative">
                <Image
                  src={encontrarOvoImagem()}
                  alt={tamanho.nome}
                  width={400}
                  height={400}
                  className="w-full rounded-lg"
                />
                {!isPacote && (
                  <div className="absolute bottom-0 left-0 right-0 bg-pink-500 bg-opacity-80 text-white p-2 rounded-b-lg">
                    <p className="text-center font-semibold">
                      {casca.nome} com {recheio.nome}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-pink-100 rounded-lg">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-pink-700">Visão Geral</h3>
                {isPacote ? (
                  <>
                    <p className="text-gray-700 font-semibold mt-2">
                      {tamanho.nome} - {tamanho.descricao}
                    </p>
                    <p className="text-gray-700 mt-2">
                      Preço: <strong className="text-pink-600 text-lg">R$ {tamanho.preco.toFixed(2)}</strong>
                    </p>
                    <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <p className="text-pink-700">
                        <strong>Com este pacote você pode escolher sabores diferentes para cada ovo!</strong>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700">
                      Casca: <strong>{casca.nome}</strong>
                    </p>
                    <p className="text-gray-700">
                      {casca.descricao}
                    </p>
                    <p className="text-gray-700 mt-2">
                      Recheio: <strong>{recheio.nome}</strong>
                    </p>
                    <p className="text-gray-700">
                      {recheio.descricao}
                    </p>
                    <p className="text-gray-700 mt-2">
                      Tamanho: <strong>{tamanho.nome}</strong>
                    </p>
                    <p className="text-gray-700 mt-2">
                      Preço: <strong className="text-pink-600 text-lg">R$ {tamanho.preco.toFixed(2)}</strong>
                    </p>
                  </>
                )}
              </div>

              {isKitConfeiteiro && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-pink-200">
                  <h3 className="font-semibold text-pink-600 mb-2">Escolha a opção do Kit:</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setOpcaoKit('mini')}
                      className={`px-4 py-2 rounded-lg ${opcaoKit === 'mini' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}
                    >
                      5 Mini Ovos (50g cada)
                    </button>
                    <button
                      onClick={() => setOpcaoKit('grande')}
                      className={`px-4 py-2 rounded-lg ${opcaoKit === 'grande' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}
                    >
                      1 Ovo Grande (250g)
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border rounded bg-white">
                  <button
                    onClick={decrementarQuantidade}
                    className="px-3 py-2 text-pink-600 hover:bg-pink-100 rounded-l"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x text-center min-w-[40px]">
                    {quantidade}
                  </span>
                  <button
                    onClick={incrementarQuantidade}
                    className="px-3 py-2 text-pink-600 hover:bg-pink-100 rounded-r"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="font-bold text-pink-700">
                  Total: R$ {precoTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={isPacote ? () => inicializarMultiplosOvos(selectedTamanho) : adicionarOvoAoCarrinho}
                className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 mt-4 font-semibold"
              >
                {isPacote ? "Escolher Sabores" : "Adicionar ao Carrinho"}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-600 mb-3">1. Escolha o Tamanho</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ovos.tamanhos.map(tamanho => (
                  <div
                    key={tamanho.id}
                    className={`border p-3 rounded-lg cursor-pointer transition ${selectedTamanho === tamanho.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                      }`}
                    onClick={() => setSelectedTamanho(tamanho.id)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full mr-2 ${selectedTamanho === tamanho.id ? 'bg-pink-500' : 'border border-gray-300'}`}></div>
                      <h3 className="font-semibold">{tamanho.nome}</h3>
                    </div>
                    {tamanho.gramas && <p className="text-sm text-gray-600">{tamanho.gramas}g</p>}
                    <p className="text-sm text-gray-600">R$ {tamanho.preco.toFixed(2)}</p>
                    {/* Adicione esta linha para mostrar a descrição */}
                    <p className="text-xs text-gray-500 mt-1">{tamanho.descricao}</p>
                  </div>
                ))}

                {ovos.pacotes.map(pacote => (
                  <div
                    key={pacote.id}
                    className={`border p-3 rounded-lg cursor-pointer transition ${selectedTamanho === pacote.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                      }`}
                    onClick={() => setSelectedTamanho(pacote.id)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full mr-2 ${selectedTamanho === pacote.id ? 'bg-pink-500' : 'border border-gray-300'}`}></div>
                      <h3 className="font-semibold">{pacote.nome}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{pacote.descricao}</p>
                    <p className="text-sm text-gray-600">R$ {pacote.preco.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {!isPacote && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-pink-600 mb-3">2. Escolha a Casca</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ovos.cascas.map(casca => (
                    <div
                      key={casca.id}
                      className={`border p-3 rounded-lg cursor-pointer transition ${selectedCasca === casca.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                        }`}
                      onClick={() => setSelectedCasca(casca.id)}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full mr-2 ${selectedCasca === casca.id ? 'bg-pink-500' : 'border border-gray-300'}`}></div>
                        <h3 className="font-semibold">{casca.nome}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{casca.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isPacote && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-pink-600 mb-3">3. Escolha o Recheio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ovos.recheios.map(recheio => (
                    <div
                      key={recheio.id}
                      className={`border p-3 rounded-lg cursor-pointer transition ${selectedRecheio === recheio.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                        }`}
                      onClick={() => setSelectedRecheio(recheio.id)}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full mr-2 ${selectedRecheio === recheio.id ? 'bg-pink-500' : 'border border-gray-300'}`}></div>
                        <h3 className="font-semibold">{recheio.nome}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{recheio.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {renderBolos()}
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 bg-[#ffcbdb] min-h-screen">
      {showConfirmation && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-up">
          <Check className="mr-2" />
          <span>{confirmationItem} adicionado ao carrinho!</span>
        </div>
      )
      }

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
          {activeTab === 'ovos' ? 'Ovos de Páscoa' : 'Bolos de Pote'}
        </h1>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('ovos')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'ovos'
              ? 'bg-pink-500 text-white'
              : 'bg-pink-200 text-pink-700 hover:bg-pink-300'
              }`}
          >
            Ovos de Páscoa
          </button>
          <button
            onClick={() => setActiveTab('bolos')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'bolos'
              ? 'bg-pink-500 text-white'
              : 'bg-pink-200 text-pink-700 hover:bg-pink-300'
              }`}
          >
            Bolos de Pote
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
        {renderContent()}
      </div>
    </div>
  )
}

export default function OvosPascoa() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <OvosPascoaContent />
    </Suspense>
  )
}