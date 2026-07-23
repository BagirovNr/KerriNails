/** Сжимает и уменьшает фото в браузере перед отправкой на сервер, чтобы не
 * гонять многомегабайтные исходники через API и не раздувать базу данных.
 * Используется при загрузке фото портфолио и картинок баннеров. */
export function compressImage(
	file: File,
	{ maxDimension = 1600, quality = 0.82 }: { maxDimension?: number; quality?: number } = {},
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
		reader.onload = () => {
			const img = new Image()
			img.onerror = () => reject(new Error('Не удалось прочитать изображение'))
			img.onload = () => {
				let { width, height } = img
				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height = Math.round((height / width) * maxDimension)
						width = maxDimension
					} else {
						width = Math.round((width / height) * maxDimension)
						height = maxDimension
					}
				}
				const canvas = document.createElement('canvas')
				canvas.width = width
				canvas.height = height
				const ctx = canvas.getContext('2d')
				if (!ctx) return reject(new Error('Canvas недоступен'))
				ctx.drawImage(img, 0, 0, width, height)
				resolve(canvas.toDataURL('image/jpeg', quality))
			}
			img.src = reader.result as string
		}
		reader.readAsDataURL(file)
	})
}
