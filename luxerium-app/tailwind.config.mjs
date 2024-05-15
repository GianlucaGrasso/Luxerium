/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			backgroundImage: {
				'feature': "url('https://placehold.co/1920x500')",
			  }
		},
	},
	plugins: [],
}
