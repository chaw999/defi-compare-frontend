import { motion } from 'framer-motion'
import DataSourceCompare from './components/DataSourceCompare'

function App() {
  return (
    <div className="app">
      <motion.header
        className="header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
              <path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Zerion VS OneKey</span>
          </div>
          <nav className="header-nav">
            <a 
              href="https://defi-onekey.qa.onekey-internal.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-link active"
            >
              <span className="nav-icon">🔄</span>
              Zerion VS OneKey
            </a>
            <a 
              href="https://defi.qa.onekey-internal.com/#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-link"
            >
              <span className="nav-icon">📊</span>
              Zerion VS DeBank
            </a>
          </nav>
        </div>
      </motion.header>

      <main className="main">
        <DataSourceCompare />
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} DeFi OneKey. 多数据源对比验证工具</p>
      </footer>
    </div>
  )
}

export default App
