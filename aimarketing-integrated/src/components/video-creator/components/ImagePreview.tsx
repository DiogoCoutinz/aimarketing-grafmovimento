// components/VideoCreator/components/ImagePreview.tsx

'use client'

import { X, Eye, EyeOff, Edit } from 'lucide-react'
import React, { useState } from 'react'
import { CropTool, type CropArea } from './CropTool'

interface ImagePreviewProps {
  src: string
  alt: string
  name: string
  size: number
  type: string
  onRemove?: () => void
  className?: string
  onEditModeChange?: (isEditMode: boolean) => void
  onImageDimensionsChange?: (dimensions: { width: number; height: number }) => void
  imageDimensions: { width: number; height: number }
  brightness?: number
  contrast?: number
  rotation?: number
  flipHorizontal?: boolean
  flipVertical?: boolean
  selectedAspectRatio?: string
  isCropMode?: boolean
  onCropApply?: (cropArea: CropArea) => void
  onCropCancel?: () => void
}

export function ImagePreview({ 
  src, 
  alt, 
  name, 
  size, 
  type, 
  onRemove,
  className = "",
  onEditModeChange,
  onImageDimensionsChange,
  imageDimensions,
  brightness = 100,
  contrast = 100,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  selectedAspectRatio = 'free',
  isCropMode = false,
  onCropApply,
  onCropCancel
}: ImagePreviewProps) {
  // UI state management
  const [showDetails, setShowDetails] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAiOptions, setShowAiOptions] = useState(false)

  // Generate CSS transforms and filters
  const imageTransforms = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `rotate(${rotation}deg)`,
    flipHorizontal ? 'scaleX(-1)' : '',
    flipVertical ? 'scaleY(-1)' : ''
  ].filter(Boolean).join(' ')

  // Handle aspect ratio
  const getObjectFit = () => {
    if (selectedAspectRatio === 'free') return 'contain'
    return 'cover' // For fixed aspect ratios, use cover to fill the container
  }

  // Container style for aspect ratio
  const getContainerStyle = () => {
    let aspectRatio = imageDimensions.width / imageDimensions.height
    
    switch (selectedAspectRatio) {
      case '1:1': aspectRatio = 1; break
      case '16:9': aspectRatio = 16/9; break
      case '9:16': aspectRatio = 9/16; break
      case '4:3': aspectRatio = 4/3; break
      case '3:4': aspectRatio = 3/4; break
      default: aspectRatio = imageDimensions.width / imageDimensions.height
    }

    const width = imageDimensions.width
    const height = selectedAspectRatio === 'free' ? imageDimensions.height : width / aspectRatio

    return {
      width: `${width}px`,
      height: `${height}px`,
      border: isCropMode ? '2px dashed #f59e0b' : '2px solid #60a5fa' // Orange for crop mode
    }
  }



  return (
    <div className={`${className} flex justify-center`}>
      <div className="animate-fade-in flex items-start gap-6 border-2 border-dashed border-yellow-400 p-2 rounded-lg">
      {/* Image Preview */}
      <div 
        className="relative inline-block rounded-xl overflow-hidden"
        style={getContainerStyle()}
      >
        <img
          src={src}
          alt={alt}
          className="block w-full h-full select-none pointer-events-none"
          style={{
            objectFit: getObjectFit() as React.CSSProperties['objectFit'],
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            transform: `rotate(${rotation}deg) ${flipHorizontal ? 'scaleX(-1)' : ''} ${flipVertical ? 'scaleY(-1)' : ''}`.trim(),
            transition: 'filter 0.2s ease, object-fit 0.2s ease'
          }}
        />
        
        {/* Interactive Crop Tool */}
        {isCropMode && (
          <CropTool
            imageWidth={imageDimensions.width}
            imageHeight={imageDimensions.height}
            aspectRatio={selectedAspectRatio}
            onCropChange={(cropArea) => {
              // Optional: Real-time crop feedback
              console.log('Crop area changed:', cropArea)
            }}
            onApplyCrop={(cropArea) => {
              console.log('Applying crop:', cropArea)
              onCropApply?.(cropArea)
            }}
            onCancel={() => {
              console.log('Canceling crop')
              onCropCancel?.()
            }}
          />
        )}
        
        
        {/* Control buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-3 border-2 border-dotted border-green-400 p-1 rounded">
          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-lg"
            title={showDetails ? 'Hide details' : 'Show details'}
          >
            {showDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          
          {/* Edit Button */}
          <button
            onClick={() => {
              const newEditMode = !isEditMode
              setIsEditMode(newEditMode)
              setShowAiOptions(newEditMode) // Show AI options when edit mode is active
              onEditModeChange?.(newEditMode)
            }}
            className={`${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-lg`}
            title={isEditMode ? 'Exit edit mode' : 'Edit size'}
          >
            <Edit className="w-3 h-3" />
          </button>
          
          
          {/* Remove Button - Only show if onRemove is provided */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-lg"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
      </div>
      
      {/* File Details - Conditionally shown */}
      {showDetails && (
        <div 
          className="flex flex-col justify-center gap-2 text-white min-w-0 border-2 border-dashed border-red-400 p-3 rounded-lg"
          style={{
            height: `${imageDimensions.height}px`
          }}
        >
          <div>
            <span className={`${imageDimensions.height < 180 ? 'text-xs' : imageDimensions.height < 250 ? 'text-sm' : 'text-base'} text-gray-400`}>Name:</span>
            <p className={`${imageDimensions.height < 180 ? 'text-xs' : imageDimensions.height < 250 ? 'text-sm' : 'text-base'} font-medium break-all`}>{name}</p>
          </div>
          <div>
            <span className={`${imageDimensions.height < 180 ? 'text-xs' : imageDimensions.height < 250 ? 'text-sm' : 'text-base'} text-gray-400`}>Size:</span>
            <p className={`${imageDimensions.height < 180 ? 'text-xs' : imageDimensions.height < 250 ? 'text-sm' : 'text-base'} font-medium`}>{(size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div>
            <span className={`${imageDimensions.height < 180 ? 'text-xs' : imageDimensions.height < 250 ? 'text-sm' : 'text-base'} text-gray-400`}>Type:</span>
            <p className={`${imageDimensions.height < 180 ? 'text-xs' : imageDimensions.height < 250 ? 'text-sm' : 'text-base'} font-medium`}>{type}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
