// components/shared/ImageGeneratorCard.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { WaveBarsLoader } from '../ui/loading-states'

interface ImageGeneratorCardProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (prompt: string) => void
  title?: string
  description?: string
  placeholder?: string
  generateButtonText?: string
  isGenerating?: boolean
  className?: string
}

export function ImageGeneratorCard({
  isOpen,
  onClose,
  onGenerate,
  title = "Generate Your First Image",
  description = "Describe what you want to create and let AI generate it for you",
  placeholder = "Describe the image you want to generate... (e.g., 'A modern smartphone floating in space with neon lights')",
  generateButtonText = "Generate Image",
  isGenerating = false,
  className = ""
}: ImageGeneratorCardProps) {
  const [prompt, setPrompt] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Random enhanced prompts for demonstration
  const enhancedPrompts = [
    "A futuristic smartphone floating in a cosmic nebula with holographic interfaces, neon blue and purple lighting, ultra-realistic, 8K resolution, cinematic composition",
    "Modern minimalist product photography with dramatic shadows, professional studio lighting, clean white background, photorealistic details, commercial quality",
    "Vibrant digital art style with geometric patterns, gradient overlays, dynamic motion blur effects, contemporary design aesthetic, high contrast colors",
    "Luxury product showcase with golden hour lighting, elegant reflections, premium materials, sophisticated composition, magazine-quality photography",
    "Cyberpunk-inspired scene with glowing elements, electric blue accents, futuristic atmosphere, detailed textures, sci-fi aesthetic",
    "Abstract artistic interpretation with flowing forms, organic shapes, dreamy atmosphere, soft pastel colors, ethereal lighting effects"
  ]

  const handleSparkleClick = () => {
    const randomPrompt = enhancedPrompts[Math.floor(Math.random() * enhancedPrompts.length)]
    setPrompt(randomPrompt)
  }

  const handleGenerate = () => {
    if (prompt.trim()) {
      // Don't close the card, just call the callback for demo purposes
      console.log('🎨 Generating image with prompt:', prompt.trim())
      onGenerate(prompt.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <div ref={cardRef} className="text-white min-w-0 rounded-xl bg-white/5 border border-white/20 overflow-hidden">
        <div className="flex">
          {/* Left side - Image placeholder */}
          <div className="w-1/2 min-w-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center min-h-[300px]">
              {isGenerating ? (
                <div className="text-center p-4">
                  <WaveBarsLoader size="sm" color="gradient" bars={5} />
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-medium text-white mb-1">{title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Input */}
          <div className="w-1/2 p-4 flex items-center justify-center">
            <div className="grid grid-cols-1 gap-3 w-full">
              {/* Prompt input section */}
              <div className="text-center">
                <span className="text-xs text-gray-400 block mb-3">Describe your image:</span>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full h-40 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-[10px] placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/25 transition-all duration-200"
                    rows={12}
                    disabled={isGenerating}
                    style={{ 
                      minHeight: '160px', 
                      maxHeight: '160px', 
                      resize: 'none',
                      fontSize: '12px',
                      lineHeight: '1.6'
                    }}
                  />
                  {/* Sparkle icon for prompt enhancement */}
                  <div 
                    onClick={handleSparkleClick}
                    className="absolute bottom-2 right-2 p-1 bg-gradient-to-r from-purple-600 to-gray-900 rounded-full cursor-pointer hover:from-purple-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Generate button section */}
              <div className="text-center">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '10px' }}
                >
                  {generateButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
