import logo from '../../assets/logo.png'
import { BiLogoInstagramAlt } from 'react-icons/bi'
import { RiTelegramFill } from 'react-icons/ri'
import { IoLogoWhatsapp } from 'react-icons/io'

function NavBar() {
	return (
		<div className='mt-15 flex gap-20 items-center bg-[#DBDBDB] p-4 rounded-lg'>
			{/* Логотип */}
			<div>
				<img className='w-30 h-auto' src={logo} alt='Логотип компании' />
			</div>

			{/* Иконки соцсетей */}
			<div className='flex gap-5'>
				<a target='_blank' href='https://www.instagram.com/kerii.nailss/'>
					<BiLogoInstagramAlt
						size={37}
						className='text-gray-700 cursor-pointer hover:text-purple-600 transition-colors active:w-10 active:h-10'
					/>
				</a>
				<a target='_blank' href='https://t.me/kerrishem'>
					<RiTelegramFill
						size={36}
						className='text-gray-700 cursor-pointer hover:text-blue-400 transition-colors active:w-10 active:h-10'
					/>
				</a>
				<a
					target='_blank'
					href='https://wa.me/+79992488379
'
				>
					<IoLogoWhatsapp
						size={35}
						className='text-gray-700 cursor-pointer hover:text-green-500 transition-colors active:w-10 active:h-10'
					/>
				</a>
			</div>
		</div>
	)
}

export default NavBar
