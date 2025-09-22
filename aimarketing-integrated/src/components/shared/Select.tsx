// components/shared/Select.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  className = '',
  disabled = false
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white
          focus:ring-2 focus:ring-purple-600 focus:border-transparent backdrop-blur-sm
          flex items-center justify-between transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/70 cursor-pointer'}
          ${isOpen ? 'border-purple-400' : ''}
          ${className.includes('text-sm') ? 'text-sm' : ''}
        `}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && (
            <span className="text-gray-400">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-3 py-2 text-left flex items-center justify-between
                hover:bg-gray-700/50 transition-colors
                ${option.value === value ? 'bg-purple-600/20 text-purple-300' : 'text-white'}
                ${className.includes('text-sm') ? 'text-sm' : ''}
              `}
            >
              <div className="flex items-center space-x-2">
                {option.icon && (
                  <span className="text-gray-400">{option.icon}</span>
                )}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
