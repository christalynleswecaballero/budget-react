import React from 'react'

export default function Toggle({ checked, onChange }){
  return (
    <button onClick={()=>onChange(!checked)} className={`w-12 h-6 rounded-full p-1 ${checked? 'bg-emerald-500':'bg-slate-300 dark:bg-slate-600'}`}>
      <div className={`bg-white w-4 h-4 rounded-full transition-transform ${checked? 'translate-x-6':'translate-x-0'}`} />
    </button>
  )
}
