import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
	const { i18n, t } = useTranslation()

	const handleLanguageChange = async (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newLang = event.target.value
		try {
			await i18n.changeLanguage(newLang)
			localStorage.setItem('preferred-language', newLang)
		} catch (error) {
			console.error('Failed to change language:', error)
		}
	}

	return (
		<select
			value={i18n.language}
			onChange={handleLanguageChange}
			className='border rounded text-sm mt-1 bg-white'
			aria-label={t('selectLanguage')}
		>
			<option value='ru'>{t('ru')}</option>
			<option value='en'>{t('en')}</option>
		</select>
	)
}

export default LanguageSwitcher
