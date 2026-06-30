import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ru from './ru/translation.json'
import en from './en/translation.json'
import az from './az/translation.json'
import uz from './uz/translation.json'
import hy from './hy/translation.json'

const saved = localStorage.getItem('lang') || 'ru'

i18n.use(initReactI18next).init({
  lng: saved,
  fallbackLng: 'ru',
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    az: { translation: az },
    uz: { translation: uz },
    hy: { translation: hy },
  },
  interpolation: { escapeValue: false },
})

export default i18n
