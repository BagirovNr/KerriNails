import nails from '../assets/nails.jpg'
import nails2 from '../assets/nails2.jpg'
import nails3 from '../assets/nails3.jpg'
import sPokritiem from '../assets/sPokritiem.jpg'

export const SERVICES = [
  { id: 1, slug: 'classic-manicure',   category: 'manicure',  name: 'Классический маникюр',         price: 1500, img: nails,       description: 'Обработка кутикулы, форма ногтей, базовое покрытие' },
  { id: 2, slug: 'gel-manicure',        category: 'manicure',  name: 'Маникюр гель-лак',             price: 2500, img: nails2,      description: 'Полная обработка + стойкое покрытие до 4 недель' },
  { id: 3, slug: 'french',              category: 'manicure',  name: 'Французский маникюр',          price: 2800, img: nails3,      description: 'Элегантный классический «лунный» дизайн' },
  { id: 4, slug: 'express-manicure',    category: 'manicure',  name: 'Экспресс-маникюр',             price: 1000, img: nails,       description: 'Быстрый маникюр без покрытия за 30 минут' },
  { id: 5, slug: 'pedicure-coating',    category: 'pedicure',  name: 'Педикюр с покрытием',          price: 2800, img: sPokritiem,  description: 'Педикюр + гель-лак, красота до 4 недель' },
  { id: 6, slug: 'pedicure-classic',    category: 'pedicure',  name: 'Классический педикюр',         price: 1800, img: sPokritiem,  description: 'Уход за стопами без покрытия' },
  { id: 7, slug: 'nail-design',         category: 'design',    name: 'Дизайн ногтей',                price: 800,  img: nails2,      description: 'Индивидуальный дизайн на 10 ногтях' },
  { id: 8, slug: 'nail-extension',      category: 'extension', name: 'Наращивание ногтей',           price: 3500, img: nails3,      description: 'Моделирование длины и формы гелем' },
  { id: 9, slug: 'correction',          category: 'extension', name: 'Коррекция наращивания',        price: 2000, img: nails,       description: 'Обновление линии роста и коррекция формы' },
  { id: 10, slug: 'spa-hands',          category: 'care',      name: 'Спа-уход для рук',             price: 1800, img: nails2,      description: 'Пилинг, маска и массаж для глубокого увлажнения' },
  { id: 11, slug: 'removal',            category: 'care',      name: 'Снятие покрытия',              price: 500,  img: nails3,      description: 'Аккуратное снятие гель-лака' },
  { id: 12, slug: 'strengthening',      category: 'care',      name: 'Укрепление ногтей',            price: 1200, img: nails,       description: 'Акриловая пудра или гель для укрепления' },
]

export const PORTFOLIO_ITEMS = [
  { id: 1, img: nails,      category: 'manicure',  title: 'Нюдовый маникюр' },
  { id: 2, img: nails2,     category: 'design',    title: 'Цветочный дизайн' },
  { id: 3, img: nails3,     category: 'manicure',  title: 'Омбре гель-лак' },
  { id: 4, img: sPokritiem, category: 'pedicure',  title: 'Педикюр с покрытием' },
  { id: 5, img: nails,      category: 'extension', title: 'Наращивание миндаль' },
  { id: 6, img: nails2,     category: 'design',    title: 'Геометрия' },
  { id: 7, img: nails3,     category: 'manicure',  title: 'Французский маникюр' },
  { id: 8, img: sPokritiem, category: 'design',    title: 'Мраморный дизайн' },
  { id: 9, img: nails,      category: 'extension', title: 'Наращивание квадрат' },
  { id: 10, img: nails2,    category: 'pedicure',  title: 'Педикюр летний' },
  { id: 11, img: nails3,    category: 'manicure',  title: 'Нежный розовый' },
  { id: 12, img: sPokritiem, category: 'design',   title: 'Абстрактный арт' },
]
