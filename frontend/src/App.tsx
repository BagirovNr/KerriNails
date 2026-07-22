import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/main'
import { AuthProvider } from './hooks/useAuth'
import { ServicesProvider } from './hooks/useServices'
import { PortfolioProvider } from './hooks/usePortfolio'
import { BannersProvider } from './hooks/useBanners'
import './index.css'

import Layout from './components/Layout/Layout'
import LandingPage from './pages/Landing/LandingPage'
import Home from './pages/Home/Home'
import Services from './pages/Services/Services'
import Portfolio from './pages/Portfolio/Portfolio'
import Prices from './pages/Prices/Prices'
import Contact from './pages/Contact/Contact'
import MyAppointments from './pages/MyAppointments/MyAppointments'
import AdminLayout from './pages/Admin/AdminLayout'
import AppointmentsTab from './pages/Admin/AppointmentsTab'
import AppointmentCalendar from './pages/Admin/AppointmentCalendar'
import ScheduleTabRoute from './pages/Admin/ScheduleTabRoute'
<<<<<<< HEAD
import ServicesTab from './pages/Admin/ServicesTab'
import PortfolioTab from './pages/Admin/PortfolioTab'
import BannersTab from './pages/Admin/BannersTab'
=======
<<<<<<< HEAD
import ServicesTab from './pages/Admin/ServicesTab'
import PortfolioTab from './pages/Admin/PortfolioTab'
import BannersTab from './pages/Admin/BannersTab'
=======
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
>>>>>>> ec29853f4cfcc07ca7a9ccccf493547b18e981a2
import StatsTab from './pages/Admin/StatsTab'
import NotFound from './pages/NotFound/NotFound'

function App() {
<<<<<<< HEAD
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ServicesProvider>
        <PortfolioProvider>
        <BannersProvider>
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

            {/* Dashboard — своя оболочка, без публичного хедера/футера/навигации сайта */}
            <Route path='/dashboard' element={<AdminLayout />}>
              <Route index element={<AppointmentsTab />} />
              <Route path='calendar' element={<AppointmentCalendar />} />
              <Route path='schedule' element={<ScheduleTabRoute />} />
              <Route path='services' element={<ServicesTab />} />
              <Route path='portfolio' element={<PortfolioTab />} />
              <Route path='banners' element={<BannersTab />} />
              <Route path='stats' element={<StatsTab />} />
            </Route>

            <Route path='*' element={<NotFound />} />
          </Routes>
        </Router>
        </BannersProvider>
        </PortfolioProvider>
        </ServicesProvider>
      </AuthProvider>
    </I18nextProvider>
  )
=======
	return (
		<I18nextProvider i18n={i18n}>
			<AuthProvider>
				<Router>
					<Routes>
						{/* Landing — no header/footer, mobile-first hub */}
						<Route path='/' element={<LandingPage />} />

						{/* Main site with Layout */}
						<Route
							path='/home'
							element={
								<Layout>
									<Home />
								</Layout>
							}
						/>
						<Route
							path='/services'
							element={
								<Layout>
									<Services />
								</Layout>
							}
						/>
						<Route
							path='/portfolio'
							element={
								<Layout>
									<Portfolio />
								</Layout>
							}
						/>
						<Route
							path='/prices'
							element={
								<Layout>
									<Prices />
								</Layout>
							}
						/>
						<Route
							path='/contact'
							element={
								<Layout>
									<Contact />
								</Layout>
							}
						/>
						<Route
							path='/my-appointments'
							element={
								<Layout>
									<MyAppointments />
								</Layout>
							}
						/>

						{/* Dashboard — своя оболочка, без публичного хедера/футера/навигации сайта */}
						<Route path='/dashboard' element={<AdminLayout />}>
							<Route index element={<AppointmentsTab />} />
							<Route path='calendar' element={<AppointmentCalendar />} />
							<Route path='schedule' element={<ScheduleTabRoute />} />
							<Route path='stats' element={<StatsTab />} />
						</Route>

						<Route path='*' element={<NotFound />} />
					</Routes>
				</Router>
			</AuthProvider>
		</I18nextProvider>
	)
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
}

export default App
