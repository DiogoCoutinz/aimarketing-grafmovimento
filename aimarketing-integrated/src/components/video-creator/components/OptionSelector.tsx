// components/VideoCreator/components/OptionSelector.tsx

'use client'

import React from 'react'

interface Option {
  id: string
  title?: string
  description: string
  isCustom?: boolean
}

interface OptionSelectorProps {
  options: Option[]
  selectedOption: string | null
  onOptionSelect: (optionId: string) => void
  customInput?: {
    value: string
    onChange: (value: string) => void
    placeholder: string
  }
  className?: string
}

export function OptionSelector({ 
  options, 
  selectedOption, 
  onOptionSelect, 
  customInput,
  className = ""
}: OptionSelectorProps) {
  return (
    <div className={`space-y-4 w-full max-w-2xl rounded-xl p-6 ${className}`}>
      {options.map((option) => (
        <div
          key={option.id}
          className={`py-4 px-6 rounded-xl border cursor-pointer transition-all flex items-center justify-center ${
            selectedOption === option.id
              ? 'border-white bg-white/10'
              : selectedOption && selectedOption !== option.id
                ? 'border-gray-700 opacity-50'
                : 'border-gray-600 hover:border-gray-400'
          }`}
          onClick={() => onOptionSelect(option.id)}
        >
          {option.isCustom && selectedOption === option.id && customInput ? (
            <textarea
              value={customInput.value}
              onChange={(e) => customInput.onChange(e.target.value)}
              placeholder={customInput.placeholder}
              className="w-full bg-transparent text-white text-sm font-bold text-center border-none outline-none resize-none placeholder-gray-400"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className={`text-sm font-bold text-center transition-all ${
              selectedOption === option.id
                ? 'text-white'
                : selectedOption && selectedOption !== option.id
                  ? 'text-gray-500'
                  : 'text-white'
            }`}>
              {option.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
