// components/VideoCreator/steps/VideoGeneration.tsx

'use client'

import { VideoCard } from '../../ui/video-card'
import { WaveBarsLoader } from '../../ui/loading-states'
import { TransitionSuggestion } from '../../../lib/aiService'

interface VideoGenerationProps {
  selectedTransition: TransitionSuggestion | null
  isGeneratingVideo: boolean
  finalVideoUrl: string | null
  videoGenerationTasks: Array<{
    id: string
    title: string
    description: string
    duration: number
  }>
  generatedImageUrl?: string | null
  imageBPreview?: string | null
  uploadedImagePreview?: string
  onGenerateVideo: () => void
  onDownloadVideo: () => void
}

export function VideoGeneration({
  selectedTransition,
  isGeneratingVideo,
  finalVideoUrl,
  videoGenerationTasks,
  generatedImageUrl,
  imageBPreview,
  uploadedImagePreview,
  onGenerateVideo,
  onDownloadVideo
}: VideoGenerationProps) {
  return (
    <div className="space-y-4">
      {/* Video Result - Show VideoCard when video is ready */}
      {finalVideoUrl && !isGeneratingVideo && (
        <div className="flex justify-center">
          <VideoCard
            id="generated-video"
            title="Vídeo Gerado"
            videoUrl={finalVideoUrl}
            thumbnail={generatedImageUrl || imageBPreview || uploadedImagePreview}
            duration="0:05"
            className="w-full max-w-xs"
            onDownload={onDownloadVideo}
          />
        </div>
      )}

      {isGeneratingVideo && (
        <div className="text-center py-8">
          <WaveBarsLoader 
            size="sm" 
            color="purple" 
            bars={5}
          />
        </div>
      )}
    </div>
  )
}
