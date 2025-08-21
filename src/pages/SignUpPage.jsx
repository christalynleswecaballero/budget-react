import React, { useEffect } from 'react'
import { SignUp, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'

export default function SignUpPage(){
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(()=>{
    if(isSignedIn) navigate('/', { replace: true })
  },[isSignedIn, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6">
        <Card>
          <SignUp routing="path" path="/" />
        </Card>
      </div>
    </div>
  )
}
