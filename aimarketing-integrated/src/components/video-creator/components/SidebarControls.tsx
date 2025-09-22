// components/VideoCreator/components/SidebarControls.tsx

'use client'

import React from 'react'

interface SidebarControlsProps {
  isVisible: boolean
  imageDimensions?: { width: number; height: number }
  onImageResize?: (value: number) => void
  onAiToolClick?: (tool: string) => void
  onBrightnessChange?: (value: number) => void
  onContrastChange?: (value: number) => void
  onRotationChange?: (value: number) => void
  onFlipHorizontal?: () => void
  onFlipVertical?: () => void
  onAspectRatioChange?: (ratio: string) => void
  onCropToggle?: () => void
  brightness?: number
  contrast?: number
  rotation?: number
  selectedAspectRatio?: string
  isCropMode?: boolean
}

export function SidebarControls({ 
  isVisible, 
  imageDimensions = { width: 200, height: 150 },
  onImageResize,
  onAiToolClick,
  onBrightnessChange,
  onContrastChange,
  onRotationChange,
  onFlipHorizontal,
  onFlipVertical,
  onAspectRatioChange,
  onCropToggle,
  brightness = 100,
  contrast = 100,
  rotation = 0,
  selectedAspectRatio = 'free',
  isCropMode = false
}: SidebarControlsProps) {
  if (!isVisible) return null

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    onImageResize?.(value)
  }

  const handleAiToolClick = (tool: string) => {
    console.log(`${tool} clicked!`)
    onAiToolClick?.(tool)
  }

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 w-72 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl z-10 overflow-hidden">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-4 py-3 border-b border-gray-700/50">
        <span className="text-sm font-medium text-gray-200">Image Controls</span>
      </div>
      
      {/* Scrollable Content */}
      <div className="max-h-[85vh] overflow-y-auto scrollbar-hide p-4 space-y-6">
      
        {/* Size Control */}
        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-300">Size</span>
            <span className="text-xs text-purple-400 font-mono">{imageDimensions.width}px</span>
          </div>
          <input
            type="range"
            min="150"
            max="500"
            step="5"
            value={imageDimensions.width}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer slider-modern"
          />
        </div>

        {/* Adjustments */}
        <div className="bg-gray-800/50 rounded-xl p-3">
          <h3 className="text-xs font-medium text-gray-300 mb-3">Adjustments</h3>
          <div className="space-y-3">
            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Brightness</span>
                <span className="text-xs text-blue-400 font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={brightness}
                onChange={(e) => onBrightnessChange?.(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer slider-modern"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Contrast</span>
                <span className="text-xs text-green-400 font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={contrast}
                onChange={(e) => onContrastChange?.(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer slider-modern"
              />
            </div>
          </div>
        </div>

        {/* Transform */}
        <div className="bg-gray-800/50 rounded-xl p-3">
          <h3 className="text-xs font-medium text-gray-300 mb-3">Transform</h3>
          
          {/* Rotation */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Rotation</span>
              <span className="text-xs text-orange-400 font-mono">{rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={rotation}
              onChange={(e) => onRotationChange?.(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer slider-modern"
            />
          </div>

          {/* Flip Controls */}
          <div className="flex gap-2">
            <button
              onClick={onFlipHorizontal}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Flip H
            </button>
            <button
              onClick={onFlipVertical}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Flip V
            </button>
          </div>
        </div>

        {/* Crop & Aspect */}
        <div className="bg-gray-800/50 rounded-xl p-3">
          <h3 className="text-xs font-medium text-gray-300 mb-3">Crop & Aspect</h3>
          
          {/* Crop Mode Toggle */}
          <div className="mb-3">
            <button
              onClick={onCropToggle}
              className={`w-full flex justify-center px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                isCropMode 
                  ? 'text-white bg-blue-600/30 border border-blue-500/50' 
                  : 'text-gray-300 bg-gray-700/50 hover:bg-gray-700/80 border border-gray-500/30'
              }`}
            >
              <span className="text-xs">{isCropMode ? 'Exit Crop Mode' : 'Enter Crop Mode'}</span>
            </button>
          </div>

          {/* Aspect Ratio Presets */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Free', value: 'free' },
                { label: '1:1', value: '1:1' },
                { label: '16:9', value: '16:9' },
                { label: '9:16', value: '9:16' },
                { label: '4:3', value: '4:3' },
                { label: '3:4', value: '3:4' }
              ].map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => onAspectRatioChange?.(ratio.value)}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    selectedAspectRatio === ratio.value
                      ? 'text-white bg-purple-600/30 border border-purple-500/50'
                      : 'text-gray-400 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="bg-gray-800/50 rounded-xl p-3">
          <h3 className="text-xs font-medium text-gray-300 mb-3">AI Tools</h3>
          
          <div className="flex flex-col gap-3">
            {/* Enhance Quality */}
            <button
              onClick={() => handleAiToolClick('Enhance Quality')}
              className="w-full flex justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">Enhance Quality</span>
            </button>

            {/* Remove Background */}
            <button
              onClick={() => handleAiToolClick('Remove Background')}
              className="w-full flex justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 hover:border-green-500/40 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">Remove Background</span>
            </button>

            {/* Upscale Image */}
            <button
              onClick={() => handleAiToolClick('Upscale Image')}
              className="w-full flex justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">Upscale Image</span>
            </button>

            {/* Color Correction */}
            <button
              onClick={() => handleAiToolClick('Color Correction')}
              className="w-full flex justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/20 hover:border-yellow-500/40 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">Color Correction</span>
            </button>

            {/* Style Transfer */}
            <button
              onClick={() => handleAiToolClick('Style Transfer')}
              className="w-full flex justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">Style Transfer</span>
            </button>

            {/* Object Removal */}
            <button
              onClick={() => handleAiToolClick('Object Removal')}
              className="w-full flex justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/20 hover:border-orange-500/40 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span className="text-xs">Object Removal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
