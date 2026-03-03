import { useState } from 'react'
import RegisterHospital from './pages/RegisterHospital'
import RegisterUser from './pages/RegisterUser'
import HomePage from './pages/HomePage'
import './App.css'

function Navbar({ page, setPage }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button
          className="navbar-brand"
          onClick={() => setPage('home')}
        >
          <div className="brand-name">KMS Portal</div>
          <div className="brand-sub">Key Management System</div>
        </button>
        <ul className="navbar-nav">
          <li>
            <button
              className={`nav-link ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${page === 'hospital' ? 'active' : ''}`}
              onClick={() => setPage('hospital')}
            >
              Register Hospital
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${page === 'user' ? 'active' : ''}`}
              onClick={() => setPage('user')}
            >
              Register User
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer">
      KMS Portal &middot; Key Management System
    </footer>
  )
}

function App() {
  const [page, setPage] = useState('home')

  const renderPage = () => {
    switch (page) {
      case 'hospital': return <RegisterHospital />
      case 'user': return <RegisterUser />
      default: return <HomePage setPage={setPage} />
    }
  }

  return (
    <div className="app-layout">
      <Navbar page={page} setPage={setPage} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}

export default App
