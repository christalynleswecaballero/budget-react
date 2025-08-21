import React from 'react'

export default function Progress({ value=0, color='emerald' }){
  const bg = 'bg-gray-200 dark:bg-slate-700'
  const fill = color === 'amber' ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className={`rounded-full ${bg} h-5 w-full`}> 
      <div className={`${fill} h-5 rounded-full text-xs text-white text-center`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}>{Math.round(value)}%</div>
    </div>
  )
}
