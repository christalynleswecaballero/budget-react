import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Register(){
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const nav = useNavigate()

  function submit(e){
    e.preventDefault()
    const r = register(username, password)
    if(!r.ok) return setErr(r.message)
    nav('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-3">Register</h2>
        {err && <div className="text-sm text-red-500 mb-2">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm">Username</label>
            <Input value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit">Create</Button>
            <Button variant="ghost" onClick={()=>nav('/login')}>Sign in</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
