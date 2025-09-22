// components/shared/FloatButton.tsx

"use client"

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Types
export interface FloatButtonProps {
  icon?: ReactNode
  description?: ReactNode
  tooltip?: ReactNode | TooltipProps
  type?: 'default' | 'primary'
  shape?: 'circle' | 'square'
  onClick?: (event: React.MouseEvent) => void
  href?: string
  target?: string
  htmlType?: 'submit' | 'reset' | 'button'
  badge?: BadgeProps
  style?: React.CSSProperties
  className?: string
}

export interface FloatButtonGroupProps {
  children: React.ReactNode
  shape?: 'circle' | 'square'
  trigger?: 'click' | 'hover'
  open?: boolean
  closeIcon?: ReactNode
  placement?: 'top' | 'left' | 'right' | 'bottom'
  onOpenChange?: (open: boolean) => void
  onClick?: (event: React.MouseEvent) => void
  icon?: ReactNode
  tooltip?: ReactNode | TooltipProps
  type?: 'default' | 'primary'
  style?: React.CSSProperties
  className?: string
}

export interface FloatButtonBackTopProps {
  duration?: number
  target?: () => HTMLElement
  visibilityHeight?: number
  onClick?: () => void
  style?: React.CSSProperties
  className?: string
  tooltip?: ReactNode | TooltipProps
}

interface BadgeProps {
  count?: number
  dot?: boolean
  color?: string
  size?: 'default' | 'small'
}

interface TooltipProps {
  title?: ReactNode
  placement?: 'top' | 'left' | 'right' | 'bottom'
  color?: string
}

// Tooltip Component
const Tooltip: React.FC<{
  children: ReactNode
  title?: ReactNode
  placement?: 'top' | 'left' | 'right' | 'bottom'
  color?: string
}> = ({ children, title, placement = 'left', color = '#000' }) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!title) return
    const rect = e.currentTarget.getBoundingClientRect()
    let x = rect.left
    let y = rect.top

    switch (placement) {
      case 'top':
        x = rect.left + rect.width / 2
        y = rect.top
        break
      case 'bottom':
        x = rect.left + rect.width / 2
        y = rect.bottom
        break
      case 'left':
        x = rect.left
        y = rect.top + rect.height / 2
        break
      case 'right':
        x = rect.right
        y = rect.top + rect.height / 2
        break
    }

    setPosition({ x, y })
    setVisible(true)
  }

  const handleMouseLeave = () => {
    setVisible(false)
  }

  const getTooltipStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      backgroundColor: color,
      color: '#fff',
      padding: '6px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s ease-in-out',
      transform: 'translate(-50%, -50%)',
    }

    switch (placement) {
      case 'top':
        return {
          ...baseStyle,
          left: position.x,
          top: position.y - 8,
          transform: 'translate(-50%, -100%)',
        }
      case 'bottom':
        return {
          ...baseStyle,
          left: position.x,
          top: position.y + 8,
          transform: 'translate(-50%, 0%)',
        }
      case 'left':
        return {
          ...baseStyle,
          left: position.x - 8,
          top: position.y,
          transform: 'translate(-100%, -50%)',
        }
      case 'right':
        return {
          ...baseStyle,
          left: position.x + 8,
          top: position.y,
          transform: 'translate(0%, -50%)',
        }
      default:
        return baseStyle
    }
  }

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {title && isMounted &&
        createPortal(
          <div style={getTooltipStyle()}>
            {title}
          </div>,
          document.body
        )}
    </>
  )
}

// Badge Component
const Badge: React.FC<{
  children: ReactNode
  count?: number
  dot?: boolean
  color?: string
  size?: 'default' | 'small'
}> = ({ children, count = 0, dot = false, color = '#ff4d4f', size = 'default' }) => {
  const showBadge = dot || count > 0

  if (!showBadge) return <>{children}</>

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: dot ? '10%' : '8%',
    right: dot ? '10%' : '8%',
    backgroundColor: color,
    color: '#fff',
    borderRadius: dot ? '50%' : '10px',
    fontSize: size === 'small' ? '10px' : '12px',
    fontWeight: 'bold',
    lineHeight: '1',
    padding: dot ? '0' : '2px 6px',
    minWidth: dot ? '6px' : '18px',
    height: dot ? '6px' : '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
    transform: 'translate(50%, -50%)',
    zIndex: 1,
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <div style={badgeStyle}>
        {!dot && count > 99 ? '99+' : !dot ? count : ''}
      </div>
    </div>
  )
}

// Main FloatButton Component
export const FloatButton: React.FC<FloatButtonProps> & {
  Group: React.FC<FloatButtonGroupProps>
  BackTop: React.FC<FloatButtonBackTopProps>
} = ({
  icon,
  description,
  tooltip,
  type = 'default',
  shape = 'circle',
  onClick,
  href,
  target,
  htmlType = 'button',
  badge,
  style,
  className = '',
}) => {
  const getButtonClasses = () => {
    const baseClasses = `
      inline-flex items-center justify-center
      border-0 cursor-pointer
      transition-all duration-200 ease-in-out
      hover:shadow-lg active:scale-95
      focus:outline-none focus:ring-2 focus:ring-offset-2
    `

    const typeClasses = {
      default: `
        bg-white text-gray-700 shadow-md
        hover:bg-gray-50 hover:shadow-xl
        focus:ring-gray-500
      `,
      primary: `
        bg-blue-600 text-white shadow-md
        hover:bg-blue-700 hover:shadow-xl
        focus:ring-blue-500
      `
    }

    const shapeClasses = {
      circle: shape === 'circle' ? 'rounded-full w-10 h-10' : '',
      square: shape === 'square' ? 'rounded-lg w-12 h-12 flex-col' : ''
    }

    return `${baseClasses} ${typeClasses[type]} ${shapeClasses[shape]} ${className}`.trim()
  }

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    ...style,
  }

  const renderButton = () => {
    const buttonContent = (
      <div className="flex items-center justify-center flex-col space-y-1">
        {icon && <div className="text-lg">{icon}</div>}
        {description && shape === 'square' && (
          <div className="text-xs font-medium">{description}</div>
        )}
      </div>
    )

    const buttonElement = href ? (
      <a
        href={href}
        target={target}
        className={getButtonClasses()}
        style={buttonStyle}
        onClick={onClick}
      >
        {buttonContent}
      </a>
    ) : (
      <button
        type={htmlType}
        className={getButtonClasses()}
        style={buttonStyle}
        onClick={onClick}
      >
        {buttonContent}
      </button>
    )

    return badge ? (
      <Badge {...badge}>{buttonElement}</Badge>
    ) : buttonElement
  }

  const tooltipProps = typeof tooltip === 'object' && tooltip !== null && 'title' in tooltip
    ? tooltip as TooltipProps
    : { title: tooltip as ReactNode }

  return (
    <Tooltip title={tooltipProps.title} placement={tooltipProps.placement} color={tooltipProps.color}>
      {renderButton()}
    </Tooltip>
  )
}

// FloatButton Group Component
const FloatButtonGroup: React.FC<FloatButtonGroupProps> = ({
  children,
  shape = 'circle',
  trigger,
  open: controlledOpen,
  closeIcon = '×',
  placement = 'top',
  onOpenChange,
  onClick,
  icon,
  tooltip,
  type = 'primary',
  style,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation()
    const newOpen = !isOpen
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
    onClick?.(event)
  }

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      const newOpen = true
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      const newOpen = false
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }
  }

  const getGroupStyle = (): React.CSSProperties => ({
    position: 'fixed',
    zIndex: 1000,
    ...style,
  })

  const getChildrenStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: isOpen ? 'auto' : 'none',
    }

    switch (placement) {
      case 'top':
        return { ...baseStyle, bottom: '60px', right: '0' }
      case 'bottom':
        return { ...baseStyle, top: '60px', right: '0' }
      case 'left':
        return { ...baseStyle, right: '60px', top: '0' }
      case 'right':
        return { ...baseStyle, left: '60px', top: '0' }
      default:
        return baseStyle
    }
  }

  const childrenArray = React.Children.toArray(children)

  return (
    <div
      style={getGroupStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {/* Main trigger button */}
      <Tooltip title={tooltip as ReactNode}>
        <button
          className={`
            inline-flex items-center justify-center
            w-10 h-10 rounded-full border-0 cursor-pointer
            transition-all duration-200 ease-in-out
            hover:shadow-lg active:scale-95
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${type === 'primary' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
              : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
            }
          `}
          onClick={trigger === 'click' ? handleToggle : undefined}
        >
          <div className="transition-transform duration-300">
            {isOpen ? closeIcon : icon}
          </div>
        </button>
      </Tooltip>

      {/* Children buttons */}
      <div style={getChildrenStyle()}>
        <div className={`
          flex ${placement === 'top' || placement === 'bottom' ? 'flex-col-reverse' : 'flex-row-reverse'}
          ${placement === 'top' ? 'space-y-reverse space-y-2' : ''}
          ${placement === 'bottom' ? 'space-y-2' : ''}
          ${placement === 'left' ? 'space-x-reverse space-x-2' : ''}
          ${placement === 'right' ? 'space-x-2' : ''}
        `}>
          {childrenArray.map((child, index) => (
            <div
              key={index}
              style={{
                transform: isOpen ? 'scale(1)' : 'scale(0.8)',
                transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms`,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// BackTop Component
const FloatButtonBackTop: React.FC<FloatButtonBackTopProps> = ({
  duration = 450,
  target,
  visibilityHeight = 400,
  onClick,
  style,
  className = '',
  tooltip = 'Back to top',
}) => {
  const [visible, setVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const getTarget = () => target ? target() : window
    
    const handleScroll = () => {
      const targetEl = getTarget()
      const scrollTop = (targetEl as Window).pageYOffset || (targetEl as Window).scrollY || (targetEl as HTMLElement).scrollTop || 0
      setVisible(scrollTop > visibilityHeight)
    }

    const targetElement = getTarget()
    if (targetElement && targetElement.addEventListener) {
      targetElement.addEventListener('scroll', handleScroll)
      handleScroll() // Check initial position
      
      return () => {
        targetElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [target, visibilityHeight, isMounted])

  const scrollToTop = () => {
    const targetElement = target ? target() : window
    const startTime = Date.now()
    const startScrollTop = (targetElement as Window).pageYOffset || (targetElement as Window).scrollY || (targetElement as HTMLElement).scrollTop || 0

    const animateScroll = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const scrollTop = startScrollTop * (1 - easeOut)
      
      if (targetElement.scrollTo) {
        targetElement.scrollTo(0, scrollTop)
      } else if ('scrollTop' in targetElement) {
        (targetElement as HTMLElement).scrollTop = scrollTop
      }

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
    onClick?.()
  }

  if (!visible || !isMounted) return null

  return (
    <Tooltip title={tooltip as ReactNode}>
      <button
        className={`
          inline-flex items-center justify-center
          w-10 h-10 rounded-full border-0 cursor-pointer
          bg-white text-gray-700 shadow-md
          hover:bg-gray-50 hover:shadow-lg
          active:scale-95
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          ${className}
        `}
        style={{
          position: 'fixed',
          zIndex: 1000,
          ...style,
        }}
        onClick={scrollToTop}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 12l-4-4h8l-4 4z" transform="rotate(180 8 8)" />
        </svg>
      </button>
    </Tooltip>
  )
}

// Attach sub-components
FloatButton.Group = FloatButtonGroup
FloatButton.BackTop = FloatButtonBackTop

export default FloatButton
