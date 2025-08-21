import React from 'react'

export default function Button({ children, className = '', variant = 'default', ...props }){
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    default: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-200 px-2 py-1',
  }
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>{children}</button>
  )
}
