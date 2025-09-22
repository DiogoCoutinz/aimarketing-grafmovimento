// components/VideoCreator/steps/MagicOptions.tsx

'use client'

import { OptionSelector } from '../components/OptionSelector'
import { WaveBarsLoader } from '../../ui/loading-states'
import { ImageAnalysis } from '../../../lib/aiService'

interface MagicOptionsProps {
  analysis: ImageAnalysis | null
  isAnalyzing: boolean
  selectedMagicOption: string | null
  customMagicInput: string
  onOptionSelect: (optionId: string) => void
  onCustomInputChange: (value: string) => void
  onProceed: (scenarioId: string) => void
  isGeneratingImage: boolean
  showImageProcessing: boolean
  generatedImageUrl: string | null
}

export function MagicOptions({
  analysis,
  isAnalyzing,
  selectedMagicOption,
  customMagicInput,
  onOptionSelect,
  onCustomInputChange,
  onProceed,
  isGeneratingImage,
  showImageProcessing,
  generatedImageUrl
}: MagicOptionsProps) {
  if (isAnalyzing) {
    return (
      <div className="text-center py-8">
        <WaveBarsLoader 
          size="sm" 
          color="purple" 
          bars={5}
          className="mb-4"
        />
      </div>
    )
  }

  if (!analysis) return null

  // Create options from analysis
  const options = [
    ...analysis.suggestedScenarios.map(scenario => ({
      id: scenario.id,
      description: scenario.description
    })),
    {
      id: 'custom',
      description: 'Escreva sua própria descrição personalizada',
      isCustom: true
    }
  ]

  const showProceedButton = selectedMagicOption && 
    (selectedMagicOption !== 'custom' || customMagicInput.trim())

  // Hide component entirely once image is generated (clean flow)
  if (generatedImageUrl) {
    return null
  }
  
  // Show processing states
  const isProcessing = isGeneratingImage || showImageProcessing
  
  if (isProcessing) {
    return (
      <div className="space-y-4">
        {/* Processing States */}
        {isGeneratingImage && (
          <div className="text-center py-4">
            <WaveBarsLoader 
              size="sm" 
              color="purple" 
              bars={5}
              className="mb-2"
            />
          </div>
        )}
        
        {/* Wave Loader - Shows for 5 seconds during image processing */}
        {showImageProcessing && (
          <div className="flex justify-center mt-6">
            <div className="animate-fade-in p-6">
              <WaveBarsLoader 
                size="sm" 
                color="purple" 
                bars={5}
                className="mb-2"
              />
            </div>
          </div>
        )}
        
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <OptionSelector
        options={options}
        selectedOption={selectedMagicOption}
        onOptionSelect={onOptionSelect}
        customInput={{
          value: customMagicInput,
          onChange: onCustomInputChange,
          placeholder: 'Descreva sua transformação personalizada...'
        }}
      />

    </div>
  )
}
