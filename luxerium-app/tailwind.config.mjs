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
				'blackBackground': 'rgba(37, 37, 37, 0.75)', 
				// Configure your color palette here
				'forSale': '#71C630',
				'forRent': '#4FB09D',
				'Sold': '#B04F4F',
				'forRentTemp': '#FC9E4F',
			  },
			  screens: {
				'sm': '640px',
				// => @media (min-width: 640px) { ... }
		  
				'md': '768px',
				// => @media (min-width: 768px) { ... }
		  
				'lg': '1024px',
				// => @media (min-width: 1024px) { ... }
		  
				'xl': '1280px',
				// => @media (min-width: 1280px) { ... }
		  
				'2xl': '1536px',
				// => @media (min-width: 1536px) { ... }
			  }
		},
	},
	plugins: [
		function({ addUtilities }) {
			const newUtilities = {
				".no-scrollbar::-webkit-scrollbar": {
					display: "none",
					},
					".no-scrollbar": {
						"-ms-overflow-style": "none",
						"scrollbar-width": "none",
					},
				};

					addUtilities(newUtilities);
			},

	],
};
