// components/VideoCreator/steps/TransitionSelection.tsx

'use client'

import { OptionSelector } from '../components/OptionSelector'
import { WaveBarsLoader } from '../../ui/loading-states'
import { TransitionSuggestion } from '../../../lib/aiService'

interface TransitionSelectionProps {
  isLoadingTransitions: boolean
  transitionSuggestions: TransitionSuggestion[]
  selectedTransitionOption: string | null
  customTransitionPrompt: string
  selectedTransition: TransitionSuggestion | null
  onTransitionOptionSelect: (optionId: string) => void
  onCustomPromptChange: (value: string) => void
  onProceed: (transition: TransitionSuggestion) => void
}

export function TransitionSelection({
  isLoadingTransitions,
  transitionSuggestions,
  selectedTransitionOption,
  customTransitionPrompt,
  selectedTransition,
  onTransitionOptionSelect,
  onCustomPromptChange,
  onProceed
}: TransitionSelectionProps) {
  if (isLoadingTransitions) {
    return (
      <div className="text-center py-4">
        <WaveBarsLoader 
          size="sm" 
          color="purple" 
          bars={5}
          className="mb-2"
        />
      </div>
    )
  }

  // Create options from transition suggestions
  const options = [
    ...transitionSuggestions.map(transition => ({
      id: transition.id,
      description: transition.description
    })),
    {
      id: 'custom',
      description: 'Escreva sua própria transição personalizada',
      isCustom: true
    }
  ]

  const showProceedButton = selectedTransitionOption && 
    (selectedTransitionOption !== 'custom' || customTransitionPrompt.trim())

  const handleProceed = () => {
    console.log('🔥 TransitionSelection handleProceed called')
    console.log('🔥 selectedTransitionOption:', selectedTransitionOption)
    console.log('🔥 customTransitionPrompt:', customTransitionPrompt)
    console.log('🔥 transitionSuggestions:', transitionSuggestions)
    
    if (selectedTransitionOption === 'custom') {
      // Create a custom transition object
      const customTransition: TransitionSuggestion = {
        id: 'custom',
        name: 'Transição Personalizada',
        description: customTransitionPrompt.trim(),
        prompt: customTransitionPrompt.trim(),
        duration: 4,
        complexity: 'medium'
      }
      console.log('🔥 Calling onProceed with custom transition:', customTransition)
      onProceed(customTransition)
    } else {
      const selectedTrans = transitionSuggestions.find(t => t.id === selectedTransitionOption)
      console.log('🔥 Found selected transition:', selectedTrans)
      if (selectedTrans) {
        console.log('🔥 Calling onProceed with selected transition:', selectedTrans)
        onProceed(selectedTrans)
      }
    }
  }

  // Hide component after transition is selected (clean flow)
  if (selectedTransition) {
    return null
  }

  return (
    <div className="space-y-4">
      <OptionSelector
        options={options}
        selectedOption={selectedTransitionOption}
        onOptionSelect={onTransitionOptionSelect}
        customInput={{
          value: customTransitionPrompt,
          onChange: onCustomPromptChange,
          placeholder: 'Descreva sua transição personalizada...'
        }}
      />

    </div>
  )
}
