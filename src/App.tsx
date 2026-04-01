import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Header from './components/Header/Header'
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

function App() {
	return (
		<I18nextProvider i18n={i18n}>
			<Router>
				<Header />
				<main>
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/services' element={<Services />} />
						<Route path='/portfolio' element={<Portfolio />} />
						<Route path='/reviews' element={<Reviews />} />
						<Route path='/contact' element={<Contact />} />
						<Route path='/discount' element={<Discount />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</main>
				{/* <Footer /> */}
			</Router>
		</I18nextProvider>
	)
}

export default App
