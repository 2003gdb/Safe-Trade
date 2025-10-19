/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SafeTrade Brand Colors (from Swift DesignSystem)
        safetrade: {
          blue: '#A1CDF4',
          orange: '#F5853F',
          dark: '#25283D',
        },
        // Status colors matching Swift app
        status: {
          accepted: '#10B981', // green-500
          progress: '#F59E0B', // amber-500
          rejected: '#EF4444', // red-500
        },
      },
      screens: {
        'xs': '475px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}