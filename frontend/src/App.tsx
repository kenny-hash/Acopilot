import { NavLink, Route, Routes } from 'react-router-dom'
import CasesPage from './pages/CasesPage'
import AgentsPage from './pages/AgentsPage'

export default function App() {
  return (
    <div className="container">
      <nav className="tabs">
        <NavLink to="/cases">用例管理</NavLink>
        <NavLink to="/agents">Agent配置</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<CasesPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/agents" element={<AgentsPage />} />
      </Routes>
    </div>
  )
}
