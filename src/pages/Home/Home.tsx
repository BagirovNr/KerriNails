import Carousel from '../../components/Carousel/Carousel'
import Header from '../../components/Header/Header'
import Services from '../Services/Services'

function Home() {
	return (
		<div className='mt-20'>
			<Header />

			<Carousel />
			<Services />
		</div>
	)
}

export default Home
