// components/ui/color-picker-float.tsx

'use client'

import { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { FloatButton } from '../shared/FloatButton'

interface ColorPickerFloatProps {
  onColorChange: (color: string) => void
  currentColor?: string
}

const predefinedColors = [
  { name: 'Original Dark', color: 'hsl(0 0% 4%)', hex: '#0a0a0a' },
  { name: 'Deep Blue', color: 'hsl(220 40% 8%)', hex: '#0d1117' },
  { name: 'Dark Purple', color: 'hsl(270 30% 8%)', hex: '#1a0d1f' },
  { name: 'Forest Green', color: 'hsl(150 30% 8%)', hex: '#0d1f14' },
  { name: 'Midnight Navy', color: 'hsl(210 50% 6%)', hex: '#080f1a' },
  { name: 'Deep Maroon', color: 'hsl(350 30% 8%)', hex: '#1f0d11' },
  { name: 'Charcoal', color: 'hsl(0 0% 12%)', hex: '#1f1f1f' },
  { name: 'Slate Blue', color: 'hsl(230 25% 10%)', hex: '#131620' },
]

export function ColorPickerFloat({ onColorChange, currentColor = 'hsl(0 0% 4%)' }: ColorPickerFloatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(currentColor)

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onColorChange(color)
    setIsOpen(false) // Close panel after selection
  }

  return (
    <>
      {/* Floating Button - Relative positioning when used in group */}
      <div className="relative group">
        <FloatButton
          icon={<Palette className="w-4 h-4" />}
          type="primary"
          onClick={() => setIsOpen(!isOpen)}
          style={{ position: 'relative' }}
        />
        {/* Custom Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
          Change background color
        </div>
      </div>

      {/* Color Picker Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel - Centered */}
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-72 bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl animate-slide-up">
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((colorOption) => (
                <button
                  key={colorOption.name}
                  onClick={() => handleColorSelect(colorOption.color)}
                  className="relative w-14 h-12 rounded-lg border-2 border-gray-600 hover:border-gray-400 transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: colorOption.hex }}
                  title={colorOption.name}
                >
                  {selectedColor === colorOption.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
