import React from 'react'
import { Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

export function PhaseDoughnut({ data, colors, title }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div style={{ height: 220 }}>
        <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  )
}

export function TrendsLine({ data }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Allocation Trends</h3>
      <div style={{ height: 320 }}>
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  )
}
