import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import GroupPage from './pages/GroupPage.jsx'
import StudentCard from './pages/StudentCard.jsx'
import Calculator from './pages/Calculator.jsx'
import Channels from './pages/Channels.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-slate-500">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="groups/:id" element={<GroupPage />} />
        <Route path="students/:id" element={<StudentCard />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="channels" element={<Channels />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
