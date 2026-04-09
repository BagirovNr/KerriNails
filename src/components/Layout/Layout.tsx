import Header from '../Header/Header'
import NavBar from '../Header/NavBar'

const Layout = ({ children }) => (
	<>
		<Header />
		<NavBar />
		{children}
	</>
)
export default Layout
