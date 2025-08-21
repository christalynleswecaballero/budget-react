// Simple local 'AI' evaluator: heuristic-based analysis of the plan
export function evaluatePlan(plan, EF_GOAL, PF_GOAL){
  const months = plan.length
  const totalEF = plan.reduce((s,m)=>s+(m.ef||0),0)
  const totalPF = plan.reduce((s,m)=>s+(m.pf||0),0)
  const totalExpenses = plan.reduce((s,m)=>s+(m.expenses||0),0)
  const totalIncome = plan.reduce((s,m)=>s+(m.income||0),0) || 1
  const avgUnallocated = plan.reduce((s,m)=>s+((m.income||0)-(m.expenses||0)-(m.ef||0)-(m.lot||0)-(m.pf||0)-(m.wants||0)),0)/months

  const efPercent = Math.min(100, (totalEF/EF_GOAL)*100)
  const pfPercent = Math.min(100, (totalPF/PF_GOAL)*100)

  // score: weighted sum of EF/PF progress and unallocated buffer
  const progressScore = Math.round((efPercent*0.6 + pfPercent*0.3 + (Math.min(100, Math.max(0, (avgUnallocated/ (totalIncome/months) )*100))*0.1)) )

  const suggestions = []
  if(efPercent < 30) suggestions.push('Increase monthly Emergency Fund allocation or reduce discretionary spending to accelerate EF growth.')
  if(efPercent >=30 && efPercent < 70) suggestions.push('Good progress on Emergency Fund — consider small monthly boosts when possible.')
  if(pfPercent < 20) suggestions.push('Property Fund is low; consider reallocating part of Wants to Property Fund if purchasing soon.')
  if(avgUnallocated < 0) suggestions.push('Many months have negative unallocated amounts — review expenses or increase income to avoid deficits.')
  if(avgUnallocated > (totalIncome/months)*0.15) suggestions.push('Healthy buffer — consider automating transfers into your top priority savings.')

  const strengths = []
  if(efPercent >= 50) strengths.push('Strong Emergency Fund progress')
  if(pfPercent >= 30) strengths.push('Good contributions toward Property Fund')

  const weaknesses = []
  if(avgUnallocated < 0) weaknesses.push('Recurring shortfalls in monthly allocations')

  const message = progressScore >= 70 ? 'On track — keep it up!' : (progressScore >= 40 ? 'Some progress — there are areas to improve.' : 'Needs attention — adjust allocations or income.')

  return {
    score: progressScore,
    efPercent: Math.round(efPercent),
    pfPercent: Math.round(pfPercent),
    avgUnallocated: Math.round(avgUnallocated),
    totalIncome, totalExpenses, totalEF, totalPF,
    message, suggestions, strengths, weaknesses
  }
}
