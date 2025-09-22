// components/shared/AnalysisCard.tsx

'use client'

import { ImageAnalysis } from '../../lib/aiService'

interface AnalysisCardProps {
  analysis: ImageAnalysis
  uploadedImageUrl?: string
  className?: string
}

export function AnalysisCard({ analysis, uploadedImageUrl, className = "" }: AnalysisCardProps) {
  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <div className="text-white min-w-0 rounded-xl bg-white/5 border border-white/20 overflow-hidden">
        <div className="flex">
          {/* Left side - Image */}
          <div className="w-1/2 min-w-0">
            {uploadedImageUrl ? (
              <img 
                src={uploadedImageUrl} 
                alt="Uploaded product"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center min-h-[160px]">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">Imagem não disponível</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Description */}
          <div className="w-1/2 p-4 flex items-center justify-center">
            <div className="grid grid-cols-1 gap-3 w-full">
              {/* First row */}
              <div className="text-center">
                <span className="text-xs text-gray-400 block mb-1">Tipo de Produto:</span>
                <p className="text-xs font-medium break-all">{analysis.productType}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-400 block mb-1">Estilo Visual:</span>
                <p className="text-xs font-medium break-all">{analysis.style}</p>
              </div>
              
              <div className="text-center">
                <span className="text-xs text-gray-400 block mb-1">Tom Emocional:</span>
                <p className="text-xs font-medium break-all">{analysis.mood}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-400 block mb-1">Cores Dominantes:</span>
                <div className="flex flex-wrap gap-1 justify-center">
                  {analysis.dominantColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full border border-gray-600" 
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-xs font-medium font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
