import { PiPhoneCallFill } from 'react-icons/pi'
import { CiMail } from 'react-icons/ci'
import { FaCommentDots } from 'react-icons/fa'
import { useState } from 'react'
import CallForm from '../forms/CallForm'
import EmailForm from '../forms/EmailForm'
import ReviewForm from '../forms/ReviewForm'

function BookingForm() {
	const [activeForm, setActiveForm] = useState(null)

	const closeForm = () => setActiveForm(null)

	return (
		<div className='fixed right-0 z-10 top-0 bottom-0'>
			{/* Панель иконок — всегда видна */}
			<div
				className={`
          flex flex-col justify-center gap-5 h-50 z-30 w-15 items-center
          fixed top-1/2 right-0
           duration-700 ease-in-out
          ${activeForm ? '-translate-x-95 ' : 'translate-x-0  '}
          bg-red-100 rounded-l-lg
        `}
			>
				<div
					className={`cursor-pointer p-2 ${activeForm === 'call' ? 'bg-red-200 rounded-2xl' : ''}`}
					title='Заказать звонок'
				>
					<PiPhoneCallFill size={30} onClick={() => setActiveForm('call')} />
				</div>
				<div
					className={`cursor-pointer p-2 ${activeForm === 'email' ? 'bg-red-200 rounded-2xl' : ''}`}
					title='Написать email'
				>
					<CiMail size={30} onClick={() => setActiveForm('email')} />
				</div>
				<div
					className={`cursor-pointer p-2 ${activeForm === 'chat' ? 'bg-red-200 rounded-2xl' : ''}`}
					title='Оставить отзыв'
				>
					<FaCommentDots size={30} onClick={() => setActiveForm('chat')} />
				</div>
			</div>

			{/* Форма — выезжает справа налево с анимацией */}
			<div
				className={`
          fixed top-0 right-0 h-full w-1/2 z-20
          transition-transform duration-700 ease-in-out
          ${activeForm ? 'translate-x-0' : 'translate-x-full '}
        `}
			>
				{activeForm === 'call' && <CallForm onClose={closeForm} />}
				{activeForm === 'email' && <EmailForm onClose={closeForm} />}
				{activeForm === 'chat' && <ReviewForm onClose={closeForm} />}
			</div>

			{/* Полупрозрачный фон для закрытия — появляется плавно */}
			<div
				className={`
          ${activeForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
				onClick={closeForm}
			/>
		</div>
	)
}

export default BookingForm
