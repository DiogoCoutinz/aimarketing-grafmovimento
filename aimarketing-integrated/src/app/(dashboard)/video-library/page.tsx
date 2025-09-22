// app/video-library/page.tsx

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  Play, 
  Download, 
  Grid3X3,
  List,
  Video
} from 'lucide-react'
import SearchInput from '@/components/shared/SearchInput'
import { VideoCard } from '@/components/ui/video-card'
import Select from '@/components/shared/Select'


type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'name' | 'type' | 'duration'
type FilterBy = 'all' | 'videos' | 'images'
type ContentType = 'video' | 'image'

// Mock data for demonstration
const mockContent = [
  {
    id: '1',
    title: 'Produto Tech - Vídeo Promocional',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://picsum.photos/300/400?random=1',
    type: 'video' as ContentType,
    duration: '0:08',
    createdAt: '2024-12-15'
  },
  {
    id: '2',
    title: 'Apresentação Empresa - Banner',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    thumbnailUrl: 'https://picsum.photos/300/400?random=2',
    type: 'image' as ContentType,
    duration: null,
    createdAt: '2024-12-14'
  },
  {
    id: '3',
    title: 'Transformação Produto - Vídeo',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/300/400?random=3',
    type: 'video' as ContentType,
    duration: '0:05',
    createdAt: '2024-12-13'
  },
  {
    id: '4',
    title: 'Paisagem - Imagem HD',
    imageUrl: 'https://picsum.photos/1200/800?random=4',
    thumbnailUrl: 'https://picsum.photos/300/400?random=4',
    type: 'image' as ContentType,
    duration: null,
    createdAt: '2024-12-12'
  },
  {
    id: '5',
    title: 'Efeito Futurista - Vídeo',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://picsum.photos/300/400?random=5',
    type: 'video' as ContentType,
    duration: '0:10',
    createdAt: '2024-12-11'
  },
  {
    id: '6',
    title: 'Design Moderno - Imagem',
    imageUrl: 'https://picsum.photos/900/600?random=6',
    thumbnailUrl: 'https://picsum.photos/300/400?random=6',
    type: 'image' as ContentType,
    duration: null,
    createdAt: '2024-12-10'
  }
]

export default function VideoLibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'video': return 'Vídeo'
      case 'image': return 'Imagem'
      default: return type
    }
  }

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case 'video': return 'bg-purple-600/20 text-purple-400 border-purple-500/30'
      case 'image': return 'bg-green-600/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter and sort content
  let filteredContent = [...mockContent]

  // Apply search filter
  if (searchQuery) {
    filteredContent = filteredContent.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTypeLabel(item.type).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Apply type filter
  if (filterBy !== 'all') {
    filteredContent = filteredContent.filter(item => {
      if (filterBy === 'videos') return item.type === 'video'
      if (filterBy === 'images') return item.type === 'image'
      return true
    })
  }

  // Apply sorting
  filteredContent.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'name':
        comparison = a.title.localeCompare(b.title)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'duration':
        const aDuration = a.duration || '0:00'
        const bDuration = b.duration || '0:00'
        comparison = aDuration.localeCompare(bDuration)
        break
    }

    return -comparison // Always sort descending (newest/highest first)
  })

  const downloadContent = async (item: { videoUrl?: string; imageUrl?: string; title?: string; type?: 'video' | 'image' }) => {
    try {
      const url = item.videoUrl || item.imageUrl
      if (!url) return
      
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = downloadUrl
      const extension = item.type === 'video' ? '.mp4' : '.jpg'
      a.download = `${item.title}${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading content:', error)
      alert(`Erro ao baixar o ${item.type === 'video' ? 'vídeo' : 'imagem'}`)
    }
  }

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar conteúdo..."
          className="flex-1 max-w-md"
        />

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Select
              value={filterBy}
              onChange={(value) => setFilterBy(value as FilterBy)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'videos', label: 'Vídeos' },
                { value: 'images', label: 'Imagens' }
              ]}
              className="min-w-[120px] text-sm"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as SortBy)}
              options={[
                { value: 'date', label: 'Data' },
                { value: 'name', label: 'Nome' },
                { value: 'type', label: 'Tipo' },
                { value: 'duration', label: 'Duração' }
              ]}
              className="min-w-[120px] text-sm"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-gray-700/50 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Video className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="text-gray-400 mb-6">
              Tente ajustar os filtros de busca ou comece criando seu primeiro conteúdo
            </p>
            <Link
              href="/video-creator"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Criar Primeiro Conteúdo
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContent.map((item) => (
            <VideoCard
              key={item.id}
              id={item.id}
              title={item.title}
              videoUrl={item.videoUrl || item.imageUrl || ''}
              thumbnail={item.thumbnailUrl}
              duration={item.type === 'image' ? '' : (item.duration || '-')}
              onLike={() => console.log('Liked content:', item.id)}
              onDownload={() => downloadContent(item)}
              onShare={() => console.log('Sharing content:', item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 h-10 bg-gray-700/50 rounded overflow-hidden mr-4">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{item.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded border ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.duration || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            const url = item.videoUrl || item.imageUrl
                            if (url) window.open(url, '_blank')
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                          title={item.type === 'video' ? 'Reproduzir' : 'Visualizar'}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadContent(item)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
