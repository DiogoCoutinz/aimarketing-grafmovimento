// components/VideoCreator/steps/MethodSelection.tsx

'use client'

import { OptionSelector } from '../components/OptionSelector'

type ScenarioType = 'magic' | 'creative' | 'viral' | null

interface MethodSelectionProps {
  selectedMethod: ScenarioType
  onMethodSelect: (method: ScenarioType) => void
  onProceed: () => void
}

const methodOptions = [
  {
    id: 'magic',
    description: 'A IA analisa e cria automaticamente a imagem final perfeita.'
  },
  {
    id: 'creative', 
    description: 'Upload suas próprias imagens e personalize cada detalhe.'
  },
  {
    id: 'viral',
    description: 'Templates virais testados que garantem engagement máximo.'
  }
]

export function MethodSelection({ selectedMethod, onMethodSelect, onProceed }: MethodSelectionProps) {
  return (
    <div className="animate-slide-in-right">
      <OptionSelector
        options={methodOptions}
        selectedOption={selectedMethod}
        onOptionSelect={(optionId) => onMethodSelect(optionId as ScenarioType)}
      />
      
    </div>
  )
}
