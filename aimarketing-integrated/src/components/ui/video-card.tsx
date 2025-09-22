// components/ui/video-card.tsx

"use client"

import React, { useState, useRef } from 'react'
import { Download, Share2, Heart, MoreVertical, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WaveBarsLoader } from './loading-states'

interface VideoCardProps {
  id: string
  title: string
  thumbnail?: string
  videoUrl?: string
  duration?: string
  status?: 'completed' | 'processing' | 'failed'
  views?: number
  likes?: number
  className?: string
  onDownload?: () => void
  onShare?: () => void
  onLike?: () => void
}

export const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  thumbnail,
  videoUrl,
  duration = "0:00",
  status = 'completed',
  views = 0,
  likes = 0,
  className,
  onDownload,
  onShare,
  onLike,
  ...props
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  if (status === 'processing') {
    return (
      <div className={cn(
        "relative bg-gray-900/50 rounded-lg overflow-hidden",
        "border border-gray-800 backdrop-blur-sm",
        className
      )}>
        <div className="aspect-video flex items-center justify-center">
          <WaveBarsLoader />
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium truncate">{title}</h3>
          <p className="text-gray-400 text-sm">Processing video...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "group relative bg-gray-900/50 rounded-lg overflow-hidden",
      "border border-gray-800 hover:border-gray-600 transition-all duration-300",
      "hover:transform hover:scale-[1.02] backdrop-blur-sm",
      className
    )}>
      
      {/* Video/Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={thumbnail}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
            <Play className="w-12 h-12 text-white/80" />
          </div>
        )}

        {/* Play Button Overlay */}
        {videoUrl && !isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handlePlay}
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Duration Badge */}
        {duration !== "0:00" && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}

        {/* Status Badge */}
        {status === 'failed' && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Failed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-medium truncate mb-2 group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span>{views.toLocaleString()} views</span>
          <span>{likes} likes</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={cn(
                "p-2 rounded-full transition-colors",
                isLiked 
                  ? "bg-red-500 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              )}
            >
              <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={onShare}
              className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {videoUrl && (
              <button
                onClick={onDownload}
                className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>

          <button className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCard