// i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Считываем сохранённый язык или используем значение по умолчанию
const savedLanguage = localStorage.getItem('preferred-language') || 'ru'

i18n.use(initReactI18next).init({
	lng: savedLanguage, // используем сохранённый или дефолтный язык
	fallbackLng: 'en',
	debug: true,
	resources: {
		en: {
			translation: {
				selectLanguage: 'Select language',
				ru: 'Russian',
				en: 'English',
				discountText: '25% discount for new customers. Click to learn more...',
				notFound: {
					title:
						'The page you are looking for could not be found — but don’t be upset!',
					weHave: 'But we have:',
					benefits: [
						'Exquisite manicure designs for every taste',
						'individual approach and impeccable execution',
						'stylish studio with a pleasant atmosphere',
					],
					backToHome: 'Go back to the main page',
				},
			},
		},
		ru: {
			translation: {
				selectLanguage: 'Выберите язык',
				ru: 'Русский',
				en: 'Английский',
				discountText:
					'Скидка -25% для новых клиентов. Нажмите, чтобы узнать подробнее...',
				notFound: {
					title:
						'Страница, которую вы ищете, не найдена — но это не повод расстраиваться!',
					weHave: 'Зато у нас есть:',
					benefits: [
						'изысканные дизайны маникюра на любой вкус;',
						'индивидуальный подход и безупречное исполнение',
						'стильная студия с приятной атмосферой',
					],
					backToHome: 'Вернуться на главную',
				},
			},
		},
	},
})

export default i18n
