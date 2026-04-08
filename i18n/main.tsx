import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Импорт переводов
import enTranslation from '../i18n/en/translation.json'
import ruTranslation from '../i18n/ru/translation.json'

const savedLanguage = localStorage.getItem('preferred-language') || 'ru'

i18n.use(initReactI18next).init({
	lng: savedLanguage,
	fallbackLng: 'en',
	debug: true,
	resources: {
		en: { translation: enTranslation },
		ru: { translation: ruTranslation },
	},
	interpolation: {
		escapeValue: false,
	},
})

export default i18n
