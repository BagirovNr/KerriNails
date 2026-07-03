// Единые утилиты времени для всего фронтенда — салон работает по
// московскому времени (UTC+3, круглый год, без перехода на летнее).
//
// ВАЖНО: раньше в BookingModal/RescheduleModal "сегодня" считалось как
// `new Date().toISOString().split('T')[0]` — а это UTC-дата, не московская!
// Ночью, когда в Москве уже наступил новый день, а по UTC ещё старый
// (например, 01:43 в Москве 4 июля = 22:43 по UTC 3 июля), эта функция
// возвращала ВЧЕРАШНЕЕ число. Из-за этого запись "на сегодня в 10:00"
// реально сохранялась с вчерашней датой и тут же считалась просроченной
// (см. hoursUntilAppointment). Все даты теперь считаются через эти функции.

export const SALON_UTC_OFFSET_HOURS = 3

function nowInSalonTZ(): Date {
	return new Date(Date.now() + SALON_UTC_OFFSET_HOURS * 60 * 60 * 1000)
}

// Сегодняшняя дата (YYYY-MM-DD) по часовому поясу салона — НЕ по UTC и НЕ
// по часовому поясу устройства клиента.
export function todayInSalonTZ(): string {
	return nowInSalonTZ().toISOString().split('T')[0]
}

// Текущий час по часовому поясу салона.
export function currentHourInSalonTZ(): number {
	return nowInSalonTZ().getUTCHours()
}

// Прошёл ли уже этот часовой слот сегодня (по времени салона).
export function isSlotPast(date: string, slot: string): boolean {
	if (date !== todayInSalonTZ()) return false
	const slotHour = parseInt(slot.split(':')[0], 10)
	return slotHour <= currentHourInSalonTZ()
}

// Сколько часов осталось до начала записи (может быть отрицательным, если
// запись уже в прошлом). Используется для правила "не позднее 4 часов".
export function hoursUntilAppointment(date: string, time: string): number {
	const startUtcMs =
		Date.parse(`${date}T${time}:00.000Z`) -
		SALON_UTC_OFFSET_HOURS * 60 * 60 * 1000
	return (startUtcMs - Date.now()) / (1000 * 60 * 60)
}
