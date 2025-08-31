import { Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Generator from '@/pages/Generator'
import SignUp from '@/pages/SignUp'
import Settings from '@/pages/Settings'
import Privacy from '@/pages/Privacy'
import Imprint from '@/pages/Imprint'
import Terms from '@/pages/Terms'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/imprint" element={<Imprint />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Generator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Landing />} />
      </Routes>
      <Toaster />
    </>
  )
}
