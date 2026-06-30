import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/main'
import { AuthProvider } from './hooks/useAuth'
import './index.css'

import Layout from './components/Layout/Layout'
import LandingPage from './pages/Landing/LandingPage'
import Home from './pages/Home/Home'
import Services from './pages/Services/Services'
import Portfolio from './pages/Portfolio/Portfolio'
import Prices from './pages/Prices/Prices'
import Contact from './pages/Contact/Contact'
import MyAppointments from './pages/MyAppointments/MyAppointments'
import AdminPanel from './pages/Admin/AdminPanel'
import NotFound from './pages/NotFound/NotFound'

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing — no header/footer, mobile-first hub */}
            <Route path='/' element={<LandingPage />} />

            {/* Main site with Layout */}
            <Route path='/home' element={<Layout><Home /></Layout>} />
            <Route path='/services' element={<Layout><Services /></Layout>} />
            <Route path='/portfolio' element={<Layout><Portfolio /></Layout>} />
            <Route path='/prices' element={<Layout><Prices /></Layout>} />
            <Route path='/contact' element={<Layout><Contact /></Layout>} />
            <Route path='/my-appointments' element={<Layout><MyAppointments /></Layout>} />
            <Route path='/admin' element={<Layout><AdminPanel /></Layout>} />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
