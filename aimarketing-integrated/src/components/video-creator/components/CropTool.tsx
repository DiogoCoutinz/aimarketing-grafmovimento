// components/VideoCreator/components/CropTool.tsx

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface CropToolProps {
  imageWidth: number
  imageHeight: number
  aspectRatio?: string
  onCropChange?: (cropArea: CropArea) => void
  onApplyCrop?: (cropArea: CropArea) => void
  onCancel?: () => void
  className?: string
}

export function CropTool({
  imageWidth,
  imageHeight,
  aspectRatio = 'free',
  onCropChange,
  onApplyCrop,
  onCancel,
  className = ''
}: CropToolProps) {
  // Initial crop area (centered, 80% of image size)
  const initialCropArea: CropArea = {
    x: imageWidth * 0.1,
    y: imageHeight * 0.1,
    width: imageWidth * 0.8,
    height: imageHeight * 0.8
  }

  const [cropArea, setCropArea] = useState<CropArea>(initialCropArea)
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialCrop, setInitialCrop] = useState<CropArea>(initialCropArea)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate aspect ratio constraint
  const getAspectRatioValue = useCallback(() => {
    switch (aspectRatio) {
      case '1:1': return 1
      case '16:9': return 16 / 9
      case '9:16': return 9 / 16
      case '4:3': return 4 / 3
      case '3:4': return 3 / 4
      default: return null
    }
  }, [aspectRatio])

  // Constrain crop area to image bounds and aspect ratio
  const constrainCropArea = useCallback((newCrop: CropArea): CropArea => {
    const aspectRatioValue = getAspectRatioValue()
    
    // Ensure crop stays within image bounds
    const constrainedCrop = {
      x: Math.max(0, Math.min(newCrop.x, imageWidth - newCrop.width)),
      y: Math.max(0, Math.min(newCrop.y, imageHeight - newCrop.height)),
      width: Math.max(20, Math.min(newCrop.width, imageWidth - newCrop.x)),
      height: Math.max(20, Math.min(newCrop.height, imageHeight - newCrop.y))
    }

    // Apply aspect ratio constraint if specified
    if (aspectRatioValue) {
      const currentRatio = constrainedCrop.width / constrainedCrop.height
      
      if (currentRatio > aspectRatioValue) {
        // Too wide, adjust width
        constrainedCrop.width = constrainedCrop.height * aspectRatioValue
      } else if (currentRatio < aspectRatioValue) {
        // Too tall, adjust height
        constrainedCrop.height = constrainedCrop.width / aspectRatioValue
      }

      // Re-constrain to bounds after aspect ratio adjustment
      if (constrainedCrop.x + constrainedCrop.width > imageWidth) {
        constrainedCrop.width = imageWidth - constrainedCrop.x
        constrainedCrop.height = constrainedCrop.width / aspectRatioValue
      }
      if (constrainedCrop.y + constrainedCrop.height > imageHeight) {
        constrainedCrop.height = imageHeight - constrainedCrop.y
        constrainedCrop.width = constrainedCrop.height * aspectRatioValue
      }
    }

    return constrainedCrop
  }, [imageWidth, imageHeight, getAspectRatioValue])

  // Handle mouse down on crop handles or crop area
  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    setDragHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialCrop({ ...cropArea })
  }, [cropArea])

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    const newCrop = { ...initialCrop }

    switch (dragHandle) {
      case 'move':
        newCrop.x = initialCrop.x + deltaX
        newCrop.y = initialCrop.y + deltaY
        break
      
      case 'nw': // North-west corner
        newCrop.x = initialCrop.x + deltaX
        newCrop.y = initialCrop.y + deltaY
        newCrop.width = initialCrop.width - deltaX
        newCrop.height = initialCrop.height - deltaY
        break
      
      case 'ne': // North-east corner
        newCrop.y = initialCrop.y + deltaY
        newCrop.width = initialCrop.width + deltaX
        newCrop.height = initialCrop.height - deltaY
        break
      
      case 'sw': // South-west corner
        newCrop.x = initialCrop.x + deltaX
        newCrop.width = initialCrop.width - deltaX
        newCrop.height = initialCrop.height + deltaY
        break
      
      case 'se': // South-east corner
        newCrop.width = initialCrop.width + deltaX
        newCrop.height = initialCrop.height + deltaY
        break
      
      case 'n': // North edge
        newCrop.y = initialCrop.y + deltaY
        newCrop.height = initialCrop.height - deltaY
        break
      
      case 's': // South edge
        newCrop.height = initialCrop.height + deltaY
        break
      
      case 'w': // West edge
        newCrop.x = initialCrop.x + deltaX
        newCrop.width = initialCrop.width - deltaX
        break
      
      case 'e': // East edge
        newCrop.width = initialCrop.width + deltaX
        break
    }

    const constrainedCrop = constrainCropArea(newCrop)
    setCropArea(constrainedCrop)
    onCropChange?.(constrainedCrop)
  }, [isDragging, dragHandle, dragStart, initialCrop, constrainCropArea, onCropChange])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Update crop area when aspect ratio changes
  useEffect(() => {
    const constrainedCrop = constrainCropArea(cropArea)
    if (JSON.stringify(constrainedCrop) !== JSON.stringify(cropArea)) {
      setCropArea(constrainedCrop)
      onCropChange?.(constrainedCrop)
    }
  }, [aspectRatio, constrainCropArea, cropArea, onCropChange])

  return (
    <div className={`absolute inset-0 ${className}`} ref={containerRef}>
      {/* Overlay background */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      {/* Crop area */}
      <div
        className="absolute border-2 border-dashed border-yellow-400 bg-transparent cursor-move"
        style={{
          left: `${cropArea.x}px`,
          top: `${cropArea.y}px`,
          width: `${cropArea.width}px`,
          height: `${cropArea.height}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Corner handles */}
        <div
          className="absolute w-3 h-3 bg-yellow-400 border border-yellow-600 rounded-full cursor-nw-resize -top-1.5 -left-1.5"
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
        />
        <div
          className="absolute w-3 h-3 bg-yellow-400 border border-yellow-600 rounded-full cursor-ne-resize -top-1.5 -right-1.5"
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
        />
        <div
          className="absolute w-3 h-3 bg-yellow-400 border border-yellow-600 rounded-full cursor-sw-resize -bottom-1.5 -left-1.5"
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
        />
        <div
          className="absolute w-3 h-3 bg-yellow-400 border border-yellow-600 rounded-full cursor-se-resize -bottom-1.5 -right-1.5"
          onMouseDown={(e) => handleMouseDown(e, 'se')}
        />

        {/* Edge handles (only show for free aspect ratio) */}
        {aspectRatio === 'free' && (
          <>
            <div
              className="absolute w-3 h-1.5 bg-yellow-400 border border-yellow-600 rounded cursor-n-resize -top-0.5 left-1/2 -translate-x-1/2"
              onMouseDown={(e) => handleMouseDown(e, 'n')}
            />
            <div
              className="absolute w-3 h-1.5 bg-yellow-400 border border-yellow-600 rounded cursor-s-resize -bottom-0.5 left-1/2 -translate-x-1/2"
              onMouseDown={(e) => handleMouseDown(e, 's')}
            />
            <div
              className="absolute w-1.5 h-3 bg-yellow-400 border border-yellow-600 rounded cursor-w-resize -left-0.5 top-1/2 -translate-y-1/2"
              onMouseDown={(e) => handleMouseDown(e, 'w')}
            />
            <div
              className="absolute w-1.5 h-3 bg-yellow-400 border border-yellow-600 rounded cursor-e-resize -right-0.5 top-1/2 -translate-y-1/2"
              onMouseDown={(e) => handleMouseDown(e, 'e')}
            />
          </>
        )}
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/80 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onApplyCrop?.(cropArea)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg transition-colors"
        >
          Apply Crop
        </button>
      </div>

      {/* Crop info */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
        <div>Size: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}</div>
        <div>Position: {Math.round(cropArea.x)}, {Math.round(cropArea.y)}</div>
        {aspectRatio !== 'free' && <div>Ratio: {aspectRatio}</div>}
      </div>
    </div>
  )
}
