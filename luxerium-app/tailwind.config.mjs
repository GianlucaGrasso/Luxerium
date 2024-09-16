/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			backgroundImage: {
				'feature': "url('https://placehold.co/1920x500')",
			  },

			  fontFamily: {
				primaryFont: ['Genera Grotesk', 'sans-serif'],
				secondaryFont: ['Archivo', 'sans-serif'],
				// Add more custom font families as needed
			  },
			  colors: {
				'primaryColor': '#F6F6F6',
				'secondaryColor': '#F99929',
				'terciaryColor': '#252525',
				'Red': '#874545',
				'Green': '#45874C',
				'lightGreyFade': 'rgba(9, 9, 9, 0.71)',
				// Configure your color palette here
			  }
		},
	},
	plugins: [],
}
