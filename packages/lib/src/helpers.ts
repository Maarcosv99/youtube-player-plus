export function generateCustomId(): string {
	return Math.random().toString(36).substr(2, 9);
}

export function loadScript(src: string, attrs?: Record<string, any>, parentNode?: HTMLElement) {
    return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		//script.async = true
		script.defer = true
		script.src = src

		Object.entries(attrs || {}).forEach(([key, value]) => {
			script.setAttribute(key, value)
		})

		script.onload = () => {
			script.onerror = script.onload = null
			resolve(script)
		}

		script.onerror = () => {
			script.onerror = script.onload = null
			reject(new Error(`Failed to load ${src}`))
		}

		const node = parentNode || document.head || document.getElementsByTagName('head')[0]
		node.appendChild(script)
    })
}
