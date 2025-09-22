// components/ui/loading-states.tsx

"use client"

import React from 'react'

// Wave Bars Loader
export const WaveBarsLoader = ({ 
  size = 'md', 
  color = 'blue',
  bars = 5,
  className = '' 
}: {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'purple' | 'green' | 'pink' | 'orange' | 'gradient'
  bars?: 3 | 4 | 5 | 6
  className?: string
}) => {
  const sizeClasses = {
    sm: { width: 'w-1', height: 'h-4', gap: 'space-x-1' },
    md: { width: 'w-1.5', height: 'h-6', gap: 'space-x-1.5' },
    lg: { width: 'w-2', height: 'h-8', gap: 'space-x-2' }
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    orange: 'bg-orange-500',
    gradient: 'bg-gradient-to-t from-blue-500 to-purple-600'
  }

  const barArray = Array.from({ length: bars }, (_, i) => i)

  return (
    <div className={`flex items-end justify-center ${sizeClasses[size].gap} ${className}`}>
      {barArray.map((index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size].width} 
            ${sizeClasses[size].height}
            ${colorClasses[color]}
            rounded-sm animate-wave-bar
          `}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes wave-bar {
          0%, 40%, 100% {
            transform: scaleY(0.4);
            opacity: 0.7;
          }
          20% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        
        .animate-wave-bar {
          animation: wave-bar 1.2s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  )
}
