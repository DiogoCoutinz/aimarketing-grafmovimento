// components/ui/video-template-card.tsx

"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../shared/Button'
import { ViralTemplate } from '../../lib/types'

interface VideoTemplateCardProps {
  template: ViralTemplate
  videoUrl: string
  thumbnailUrl: string
  isSelected?: boolean
  onSelect?: (template: ViralTemplate) => void
  className?: string
}

export const VideoTemplateCard: React.FC<VideoTemplateCardProps> = ({
  template,
  videoUrl,
  thumbnailUrl,
  isSelected = false,
  onSelect,
  className = ''
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.stopPropagation()
    const video = e.target as HTMLVideoElement
    if (video.paused) {
      video.play()
      setIsVideoPlaying(true)
    } else {
      video.pause()
      setIsVideoPlaying(false)
    }
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(template)
  }

  return (
    <div className={cn("cursor-pointer hover:scale-105 transition-transform", className)}>
      <div className={cn(
        "relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl aspect-[3/4]",
        isSelected 
          ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
          : 'border-gray-700/50 hover:border-gray-600/50'
      )}>
        <div className="absolute inset-0 w-full h-full bg-black">
          {/* Background thumbnail */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundSize: '100% 100%'
            }}
          />
          
          {/* Video element */}
          <video
            className="w-full h-full object-fill relative z-10"
            preload="metadata"
            muted
            loop
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onClick={handleVideoClick}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          {/* Play Icon Overlay - only show when video is paused */}
          {!isVideoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 video-overlay pointer-events-none">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
              </div>
            </div>
          )}

          {/* Select Button */}
          <div className="absolute bottom-2 right-2 z-20">
            <Button
              variant="secondary"
              size="xs"
              onClick={handleSelectClick}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Template Name Below Card */}
      <div className="mt-3">
        <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
          {template.name}
        </h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-1">
          {template.description}
        </p>
      </div>
    </div>
  )
}

// Grid component for displaying multiple template cards
export const VideoTemplateGrid: React.FC<{
  templates: ViralTemplate[]
  videoUrls: string[]
  thumbnailUrls: string[]
  selectedTemplateId?: string | null
  onTemplateSelect?: (template: ViralTemplate) => void
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({
  templates,
  videoUrls,
  thumbnailUrls,
  selectedTemplateId,
  onTemplateSelect,
  columns = 3,
  gap = 'md',
  className = ''
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const gapSizes = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  return (
    <div className={cn('grid', gridCols[columns], gapSizes[gap], 'max-w-4xl mx-auto', className)}>
      {templates.map((template, index) => (
        <VideoTemplateCard
          key={template.id}
          template={template}
          videoUrl={videoUrls[index] || ''}
          thumbnailUrl={thumbnailUrls[index] || ''}
          isSelected={selectedTemplateId === template.id}
          onSelect={onTemplateSelect}
        />
      ))}
    </div>
  )
}
