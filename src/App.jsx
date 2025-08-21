import React, { useEffect, useMemo, useState } from 'react'
import Sunflower from './icons/Sunflower'
import { PhaseDoughnut, TrendsLine } from './components/ChartArea'
import Button from './components/ui/Button'
import Input from './components/ui/Input'
import Card from './components/ui/Card'
import Toggle from './components/ui/Toggle'
import Progress from './components/ui/Progress'
import { evaluatePlan } from './lib/evaluator'
import { useUser, useClerk } from '@clerk/clerk-react'

const NUM_MONTHS = 60
const EF_GOAL = 270000
const PF_GOAL = 705000

function currency(n){ return `₱${n.toLocaleString()}` }

export default function App(){
  const initial = useMemo(()=> Array.from({length: NUM_MONTHS}, (_,i)=>({ month: i+1, income:0, expenses:0, ef:0, lot:0, pf:0, wants:0, locked:false })),[])
  const [plan, setPlan] = useState(initial)
  const [income, setIncome] = useState('')
  const [dark, setDark] = useState(true)
  const [evaluation, setEvaluation] = useState(null)
  const [quote, setQuote] = useState('')
  const { user } = useUser()
  let clerk = null
  try { clerk = useClerk && useClerk() } catch(e){ clerk = null }

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
  },[dark])

  useEffect(()=>{
    if(income === '') return
    const val = parseFloat(income) || 0
    setPlan(p => p.map(m => m.locked ? m : ({...m, income: val})))
  },[income])

  // persist plan locally
  useEffect(()=>{
    const raw = localStorage.getItem('budget-plan')
    if(raw) try{ setPlan(JSON.parse(raw)) }catch(e){}
    const inc = localStorage.getItem('budget-income')
    if(inc) setIncome(inc)
    const d = localStorage.getItem('budget-dark')
    if(d) setDark(d === 'true')
  },[])
  // persist plan, income, dark mode
  useEffect(()=> localStorage.setItem('budget-plan', JSON.stringify(plan)),[plan])
  useEffect(()=> localStorage.setItem('budget-income', income),[income])
  useEffect(()=> localStorage.setItem('budget-dark', dark.toString()),[dark])

  // saved indicator
  const [lastSaved, setLastSaved] = React.useState(()=>{
    const t = localStorage.getItem('budget-last-saved')
    return t ? new Date(parseInt(t,10)) : null
  })
  useEffect(()=>{
    const t = Date.now()
    localStorage.setItem('budget-last-saved', String(t))
    setLastSaved(new Date(t))
  },[plan, income, dark])

  function updateCell(idx, key, value){
    setPlan(p=>{
      const copy = [...p]
      copy[idx] = {...copy[idx], [key]: parseFloat(value)||0}
      return copy
    })
  }

  function toggleLock(idx){
    setPlan(p=>{
      const copy = [...p]
      copy[idx] = {...copy[idx], locked: !copy[idx].locked}
      return copy
    })
  }

  const totals = useMemo(()=>{
    const totalExpenses = plan.reduce((s,m)=>s+m.expenses,0)
    const totalEF = plan.reduce((s,m)=>s+m.ef,0)
    const totalPF = plan.reduce((s,m)=>s+m.pf,0)
    return { totalExpenses, totalEF, totalPF }
  },[plan])

  const quotes = [
    "A budget is telling your money where to go instead of wondering where it went. — Dave Ramsey",
    "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
    "Beware of little expenses; a small leak will sink a great ship. — Benjamin Franklin",
    "The quickest way to double your money is to fold it in half and put it in your pocket. — Will Rogers"
  ]

  function pickQuote(){ setQuote(quotes[Math.floor(Math.random()*quotes.length)]) }

  function runEvaluation(){
    const res = evaluatePlan(plan, EF_GOAL, PF_GOAL)
    setEvaluation(res)
  }

  function resetPlan(){
    if(!confirm('Reset plan to default values? This cannot be undone.')) return
    const newPlan = Array.from({length: NUM_MONTHS}, (_,i)=>({ month: i+1, income:0, expenses:0, ef:0, lot:0, pf:0, wants:0, locked:false }))
    setPlan(newPlan)
    setIncome('')
  }

  const efPercent = Math.min(100, (totals.totalEF/EF_GOAL)*100)
  const pfPercent = Math.min(100, (totals.totalPF/PF_GOAL)*100)

  // Charts data
  const phaseA = plan.slice(0,13)
  const phaseB = plan.slice(13,36)
  const phaseC = plan.slice(36,60)

  const doughnutTemplate = (dataArray) => ({
    labels: ['Expenses','Emergency Fund','Lot DP/Amort.','Property Fund','Wants'],
    datasets: [{ data: dataArray, backgroundColor: ['#0f766e','#064e3b','#ea580c','#f59e0b','#eab308'] }]
  })

  const phase1Data = doughnutTemplate([avg(phaseA,'expenses'), avg(phaseA,'ef'), avg(phaseA,'lot'), avg(phaseA,'pf'), avg(phaseA,'wants')])
  const phase2Data = doughnutTemplate([avg(phaseB,'expenses'), avg(phaseB,'ef'), avg(phaseB,'lot'), avg(phaseB,'pf'), avg(phaseB,'wants')])
  const phase3Data = doughnutTemplate([avg(phaseC,'expenses'), avg(phaseC,'ef'), avg(phaseC,'lot'), avg(phaseC,'pf'), avg(phaseC,'wants')])

  const trendsData = {
    labels: plan.map(m=>`M${m.month}`),
    datasets: [
      { label: 'Emergency Fund', data: plan.map(m=>m.ef), borderColor:'#0f766e', backgroundColor:'#0f766e33', fill:true, tension:0.2 },
      { label: 'Lot DP / Amort.', data: plan.map(m=>m.lot), borderColor:'#ea580c', backgroundColor:'#ea580c33', fill:true, tension:0.2 },
      { label: 'Property Fund', data: plan.map(m=>m.pf), borderColor:'#f59e0b', backgroundColor:'#f59e0b33', fill:true, tension:0.2 }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
    <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sunflower className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold">Your 5-Year Financial Journey</h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">Interactive monthly allocation planner</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 mr-2">{user? `Hi, ${user.primaryEmailAddress?.emailAddress || user.firstName || user.id}` : ''}</div>
      <Button onClick={()=>setDark(d=>!d)}>{dark? 'Dark' : 'Light'}</Button>
            {user && <Button variant="ghost" onClick={()=>clerk?.signOut?.()}>Logout</Button>}
          </div>
        </header>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Master Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Monthly Income</label>
              <Input type="number" value={income} onChange={e=>setIncome(e.target.value)} placeholder="e.g., 50000" />
            </div>
            <div className="text-sm text-slate-500">
              Enter an income to apply it to all unlocked rows. Click the sunflower icon in a row to lock it.
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-500">{lastSaved? `Last saved: ${lastSaved.toLocaleString()}` : 'Not saved yet'}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={resetPlan}>Reset Plan</Button>
            </div>
          </div>
        </Card>

  <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <h3 className="text-2xl font-bold">{currency(totals.totalExpenses)}</h3>
            <p className="text-sm text-slate-500">Total Expenses Over 60 Months</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold">{currency(EF_GOAL)}</h3>
            <p className="text-sm text-slate-500">Target Emergency Fund</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold">60 Months</h3>
            <p className="text-sm text-slate-500">Total Plan Duration</p>
          </div>
        </section>

        {/* Quick quote + AI evaluator */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <h3 className="font-semibold">Daily Financial Quote</h3>
            <p className="mt-2 text-sm italic text-slate-600">{quote || 'Click the button to get a finance quote.'}</p>
            <div className="mt-3"><Button onClick={pickQuote}>Get Quote</Button></div>
          </Card>

          <Card>
            <h3 className="font-semibold">AI Progress Evaluator</h3>
            <p className="mt-2 text-sm text-slate-600">Run a quick analysis of your current plan and get suggestions.</p>
            <div className="mt-3 flex items-center gap-3">
              <Button onClick={runEvaluation}>Evaluate Progress</Button>
              {evaluation && <div className="text-sm">Score: <strong>{evaluation.score}</strong></div>}
            </div>
            {evaluation && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Status: {evaluation.message}</p>
                <p className="mt-2"><strong>EF:</strong> {evaluation.efPercent}% — <strong>PF:</strong> {evaluation.pfPercent}%</p>
                <ul className="mt-2 list-disc ml-5 text-slate-600">
                  {evaluation.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
                </ul>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold">Snapshot</h3>
            <div className="mt-2 text-sm">
              <p><strong>Monthly income (sample):</strong> {income || '—'}</p>
              <p className="mt-1"><strong>EF Progress:</strong> {Math.round((totals.totalEF/EF_GOAL)*100 || 0)}%</p>
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h3 className="font-semibold mb-2">Emergency Fund Goal</h3>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: `${efPercent}%` }}>{Math.round(efPercent)}%</div>
            </div>
            <div className="text-right mt-2 text-sm">{currency(totals.totalEF)} / {currency(EF_GOAL)}</div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Property Fund Goal</h3>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: `${pfPercent}%`, backgroundColor:'#f59e0b' }}>{Math.round(pfPercent)}%</div>
            </div>
            <div className="text-right mt-2 text-sm">{currency(totals.totalPF)} / {currency(PF_GOAL)}</div>
          </div>
        </section>

        <section className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Allocation Timeline</h2>

          {/* Desktop / md+: table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="p-2">Month</th>
                  <th className="p-2">Income</th>
                  <th className="p-2">Expenses</th>
                  <th className="p-2">Emergency Fund</th>
                  <th className="p-2">Lot DP/Amort.</th>
                  <th className="p-2">Property Fund</th>
                  <th className="p-2">Wants</th>
                  <th className="p-2">Unallocated</th>
                  <th className="p-2">Lock</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((m, idx)=>{
                  const allocated = m.expenses + m.ef + m.lot + m.pf + m.wants
                  const unallocated = m.income - allocated
                  return (
                    <tr key={m.month} className={m.locked? 'opacity-80': ''}>
                      <td className="p-2 font-medium">{m.month}</td>
                      <td className="p-2">{currency(m.income)}</td>
                      <td className="p-2"><Input type="number" value={m.expenses} onChange={e=>updateCell(idx,'expenses',e.target.value)} disabled={m.locked} /></td>
                      <td className="p-2"><Input type="number" value={m.ef} onChange={e=>updateCell(idx,'ef',e.target.value)} disabled={m.locked} /></td>
                      <td className="p-2"><Input type="number" value={m.lot} onChange={e=>updateCell(idx,'lot',e.target.value)} disabled={m.locked} /></td>
                      <td className="p-2"><Input type="number" value={m.pf} onChange={e=>updateCell(idx,'pf',e.target.value)} disabled={m.locked} /></td>
                      <td className="p-2"><Input type="number" value={m.wants} onChange={e=>updateCell(idx,'wants',e.target.value)} disabled={m.locked} /></td>
                      <td className={`p-2 font-semibold ${unallocated<0? 'text-red-400':''}`}>{currency(unallocated)}</td>
                      <td className="p-2 text-center"><Button variant="ghost" onClick={()=>toggleLock(idx)} aria-label={`Lock month ${m.month}`}><Sunflower className="h-5 w-5" /></Button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: responsive cards */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {plan.map((m, idx)=>{
              const allocated = m.expenses + m.ef + m.lot + m.pf + m.wants
              const unallocated = m.income - allocated
              return (
                <div key={m.month} className={`p-3 rounded border dark:border-slate-700 ${m.locked? 'bg-slate-50 dark:bg-slate-800':''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Month {m.month}</div>
                    <Button variant="ghost" onClick={()=>toggleLock(idx)} aria-label={`Lock month ${m.month}`}><Sunflower className="h-5 w-5" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Income</div><div className="font-medium">{currency(m.income)}</div>
                    <div>Expenses</div><div><Input type="number" value={m.expenses} onChange={e=>updateCell(idx,'expenses',e.target.value)} disabled={m.locked} /></div>
                    <div>Emergency</div><div><Input type="number" value={m.ef} onChange={e=>updateCell(idx,'ef',e.target.value)} disabled={m.locked} /></div>
                    <div>Lot</div><div><Input type="number" value={m.lot} onChange={e=>updateCell(idx,'lot',e.target.value)} disabled={m.locked} /></div>
                    <div>Property</div><div><Input type="number" value={m.pf} onChange={e=>updateCell(idx,'pf',e.target.value)} disabled={m.locked} /></div>
                    <div>Wants</div><div><Input type="number" value={m.wants} onChange={e=>updateCell(idx,'wants',e.target.value)} disabled={m.locked} /></div>
                    <div>Unallocated</div><div className={`font-semibold ${unallocated<0? 'text-red-400':''}`}>{currency(unallocated)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <PhaseDoughnut data={phase1Data} title={`Avg. Allocation (Months 1-13)`} />
          <PhaseDoughnut data={phase2Data} title={`Avg. Allocation (Months 14-36)`} />
          <PhaseDoughnut data={phase3Data} title={`Avg. Allocation (Months 37-60)`} />
        </section>

        <section className="mb-6">
          <TrendsLine data={trendsData} />
        </section>

        <footer className="text-center text-sm text-slate-400 mt-8">Interactive financial planner.</footer>
      </div>
    </div>
  )
}

function avg(arr,key){ return arr.length? arr.reduce((s,o)=>s+(o[key]||0),0)/arr.length : 0 }
