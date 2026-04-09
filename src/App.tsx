import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Contact from './pages/Contact/Contact'
import Discount from './pages/Discount/Discount'
import Home from './pages/Home/Home'
import NotFound from './pages/NotFound/NotFound'
import Portfolio from './pages/Portfolio/Portfolio'
import Reviews from './pages/Reviews/Reviews'
import Services from './pages/Services/Services'
import i18n from '../i18n/main'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import Prices from './pages/Prices/Prices'
import LandingPage from './pages/Landing/LandingPage'
import Layout from './components/Layout/Layout'

function App() {
	return (
		<I18nextProvider i18n={i18n}>
			<Router>
				<main>
					<Routes>
						<Route path='/' element={<LandingPage />} />
						<Route
							path='/services'
							element={
								<Layout>
									<Services />
								</Layout>
							}
						/>
						<Route
							path='/home'
							element={
								<Layout>
									<Home />
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
							path='/reviews'
							element={
								<Layout>
									<Reviews />
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
							path='/prices'
							element={
								<Layout>
									<Prices />
								</Layout>
							}
						/>
						<Route
							path='/discount'
							element={
								<Layout>
									<Discount />
								</Layout>
							}
						/>
						<Route path='*' element={<NotFound />} />
					</Routes>
				</main>
			</Router>
		</I18nextProvider>
	)
}

export default App
