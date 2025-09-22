// components/ui/checkbox.tsx

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  id?: string
  name?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, disabled, className, children, id, name, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            name={name}
            id={id}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "checkbox-custom w-4 h-4 rounded border-2 cursor-pointer transition-all duration-300 ease-in-out",
              "border-gray-400 bg-transparent",
              "hover:border-blue-400",
              "focus-within:ring-2 focus-within:ring-blue-200 focus-within:ring-offset-1",
              checked && "bg-blue-500 border-blue-500 checkbox-checked",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            <svg
              className={cn(
                "checkmark w-3 h-3 text-white absolute top-0 left-0 transform transition-all duration-200",
                checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
        </div>
        {children && (
          <label
            htmlFor={id}
            className={cn(
              "ml-2 text-sm cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {children}
          </label>
        )}
        
        <style jsx>{`
          .checkbox-custom {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .checkbox-checked {
            animation: checkboxPop 0.2s ease-in-out;
          }
          
          @keyframes checkboxPop {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
          
          .checkmark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        `}</style>
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
