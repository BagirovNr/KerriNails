import { ReactNode } from 'react'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className='min-h-screen flex flex-col overflow-x-hidden'>
			<Header />
			<main className='flex-1 pt-[105px] md:pt-[130px]'>{children}</main>
			<Footer />
		</div>
	)
}
