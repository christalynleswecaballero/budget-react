import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import './index.css'
import { ClerkProvider, useUser } from '@clerk/clerk-react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'

function RequireAuth({ children }){
  const { isSignedIn } = useUser()
  if(!isSignedIn) return <Navigate to="/sign-in" replace />
  return children
}

const clerkPublishable = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishable}>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in/*" element={<SignInPage/>} />
          <Route path="/sign-up/*" element={<SignUpPage/>} />
          <Route path="/*" element={<RequireAuth><App/></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
