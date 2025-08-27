import { Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Generator from '@/pages/Generator'
import SignUp from '@/pages/SignUp'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Generator />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Landing />} />
      </Routes>
      <Toaster />
    </>
  )
}
