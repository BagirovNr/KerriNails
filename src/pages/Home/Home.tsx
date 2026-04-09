import BookingForm from '../../components/BookingForm/BookingForm'
import Carousel from '../../components/Carousel/Carousel'
import Services from '../Services/Services'

function Home() {
	return (
		<div className='mt-20'>
			<BookingForm />
			<Carousel />
			<Services />
		</div>
	)
}

export default Home
