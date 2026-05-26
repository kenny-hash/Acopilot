import { NavLink, Route, Routes } from 'react-router-dom'
import CasesPage from './pages/CasesPage'
import AgentsPage from './pages/AgentsPage'
import ApiParserPage from './pages/ApiParserPage'
import PlatformPage from './pages/PlatformPage'

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Acopilot Admin</div>
        <div className="tips">shadcn-admin 风格布局（侧边导航 + 顶栏 + 内容区）</div>
        <nav className="tabs">
          <NavLink to="/cases">📄 用例管理</NavLink>
          <NavLink to="/agents">🤖 Agent 配置</NavLink>
          <NavLink to="/api-parser">🔌 API 解析</NavLink>
          <NavLink to="/platform">🧪 测试集与任务</NavLink>
        </nav>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <h1>业务控制台</h1>
          <span className="meta">Dashboard / Operations</span>
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<CasesPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/api-parser" element={<ApiParserPage />} />
            <Route path="/platform" element={<PlatformPage />} />
          </Routes>
        </main>
      </section>
    </div>
  )
}
