import { useState } from 'react'
import * as emailjs from '@emailjs/browser'

function CallForm({ onClose }) {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		time: new Date().toLocaleString('ru-RU'), // Добавляем время отправки
	})
	const [isSending, setIsSending] = useState(false)
	const [message, setMessage] = useState('')

	// Константы — лучше вынести в переменные окружения
	const SERVICE_ID = 'service_b4h31vg'
	const TEMPLATE_ID = 'template_gpqcky8'
	const PUBLIC_KEY = 'ulGiv5apnpYmr70XB' // Замените на актуальный Public Key

	const handleChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const validateForm = () => {
		setMessage('') // Очищаем предыдущее сообщение

		if (!formData.name.trim()) {
			setMessage('Пожалуйста, введите имя')
			return false
		}
		if (!formData.phone.trim()) {
			setMessage('Пожалуйста, введите телефон')
			return false
		}
		// Простая проверка формата телефона (начинается с +7 или 8, минимум 10 цифр)
		const phoneRegex = /^(\+7|8)[0-9]{10}$/
		if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
			setMessage('Введите корректный номер телефона')
			return false
		}
		return true
	}

	const handleSubmit = e => {
		e.preventDefault()

		if (isSending) return // Блокируем повторную отправку

		if (!validateForm()) return

		setIsSending(true)
		setMessage('')

		// Очищаем номер телефона: оставляем только цифры
		const cleanPhone = formData.phone.replace(/\D/g, '')
		// Добавляем префикс +7, если его нет
		const formattedPhone = cleanPhone.startsWith('7')
			? `+${cleanPhone}`
			: `+7${cleanPhone.substring(1)}`

		// Создаём объект для отправки с очищенным номером
		const emailData = {
			...formData,
			phone: formattedPhone, // Передаём очищенный номер
			displayPhone: formData.phone, // Сохраняем исходный формат для отображения в письме
		}

		emailjs
			.send(SERVICE_ID, TEMPLATE_ID, emailData, PUBLIC_KEY)
			.then(
				() => {
					setMessage('Сообщение успешно отправлено!')
					setFormData({
						name: '',
						phone: '',
						time: new Date().toLocaleString('ru-RU'),
					})
					setTimeout(onClose, 2000)
				},
				error => {
					console.error('EmailJS error:', error)
					setMessage('Ошибка при отправке. Попробуйте ещё раз.')
				},
			)
			.finally(() => {
				setIsSending(false)
			})
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='p-6 bg-white rounded-xl shadow-2xl w-1/2 h-full fixed right-0 top-0 flex flex-col'
		>
			<button
				type='button'
				onClick={onClose}
				className='float-right text-3xl cursor-pointer text-gray-500 mt-20 ml-auto'
			>
				×
			</button>

			<div className='flex-grow flex flex-col justify-center'>
				<h3 className='text-xl font-bold mb-4'>Заказать звонок</h3>
				<p>Представьтесь, и мы вам перезвоним</p>

				<div className='mt-4'>
					<input
						type='text'
						name='name'
						placeholder='Имя'
						value={formData.name}
						onChange={handleChange}
						className='border p-3 mb-3 w-full rounded'
						required
					/>
					<input
						type='tel'
						name='phone'
						placeholder='Телефон (+7 XXX XXX XX XX)'
						value={formData.phone}
						onChange={handleChange}
						className='border p-3 w-full rounded mb-4'
						required
					/>
					<button
						type='submit'
						disabled={isSending}
						className={`px-4 py-2 rounded w-full cursor-pointer ${
							isSending
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-500 text-white'
						}`}
					>
						{isSending ? 'Отправка...' : 'Отправить'}
					</button>
					{message && (
						<p
							className={`mt-2 text-center ${
								message.includes('успешно') ? 'text-green-600' : 'text-red-600'
							}`}
						>
							{message}
						</p>
					)}
				</div>
			</div>
		</form>
	)
}

export default CallForm
