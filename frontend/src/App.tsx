import { NavLink, Route, Routes } from 'react-router-dom'
import CasesPage from './pages/CasesPage'
import AgentsPage from './pages/AgentsPage'
import ApiParserPage from './pages/ApiParserPage'

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar card">
        <div className="brand">业务控制台</div>
        <div className="tips">通过左侧栏目切换不同业务模块</div>
        <nav className="tabs">
          <NavLink to="/cases">用例管理</NavLink>
          <NavLink to="/agents">Agent 配置</NavLink>
          <NavLink to="/api-parser">API 解析</NavLink>
        </nav>
      </aside>
      <main className="container">
        <Routes>
          <Route path="/" element={<CasesPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/api-parser" element={<ApiParserPage />} />
        </Routes>
      </main>
    </div>
  )
}
