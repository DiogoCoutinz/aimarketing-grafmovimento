// contexts/ThemeContext.tsx

"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  backgroundColor: string
  setBackgroundColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [backgroundColor, setBackgroundColorState] = useState('hsl(0 0% 4%)')

  // Load saved color from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('app-background-color')
    if (savedColor) {
      setBackgroundColorState(savedColor)
    }
  }, [])

  // Apply background color to body and save to localStorage
  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor
    localStorage.setItem('app-background-color', backgroundColor)
  }, [backgroundColor])

  const setBackgroundColor = (color: string) => {
    setBackgroundColorState(color)
  }

  return (
    <ThemeContext.Provider value={{ backgroundColor, setBackgroundColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
