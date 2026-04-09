function EmailForm({ onClose }) {
	return (
		<form className='p-6 bg-white rounded-xl shadow-2xl w-1/2 h-full fixed right-0 top-0 flex flex-col'>
			<button
				onClick={onClose}
				className='float-right text-3xl cursor-pointer text-gray-500 mt-20 ml-auto'
			>
				×
			</button>

			<div className='flex-grow flex flex-col justify-center'>
				<h3 className='text-xl font-bold mb-4'>Заказать звонок</h3>
				<p>Представьтесь, и мы вам перезвоним</p>
				<form className='mt-4'>
					<input
						type='text'
						placeholder='Имя'
						className='border p-3 mb-3 w-full rounded'
					/>
					<input
						type='tel'
						placeholder='Телефон'
						className='border p-3 w-full rounded mb-4'
					/>
					<input
						type='tel'
						placeholder='Телефон'
						className='border p-3 w-full rounded mb-4'
					/>
					<button
						type='submit'
						className='bg-blue-500 text-white px-4 py-2 rounded w-full'
					>
						Отправить
					</button>
				</form>
			</div>
		</form>
	)
}

export default EmailForm
