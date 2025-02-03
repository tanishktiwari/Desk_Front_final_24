/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',  // Custom breakpoint for 320px
        'sm': '375px',  // Custom breakpoint for 375px
        'md': '768px',  // Custom breakpoint for 425px
        '2xl': '1440px',  // Custom breakpoint for 1024px
        'xl': '2560px'
      },
      colors: {
        'custom-blue': '#0a3e53', // Existing custom color
        'custom-blue1': '#0a3e53', // New custom color
        'custom-green': '#23a76b', // New custom color
        'customGray': '#e8ecef',
        'buttoncolor': '#7a5cfa',
        'fontcolor': '#666666',
        'light-purple-1': '#F3E8FF', // Lighter version of #9181F4
        'light-purple-2': '#D6C7FF', // Lighter version of #5038ED
        'textcolor': "#525252",
        'placeholderc' : "#1c1c1c"
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(99.78deg, #9181F4 -5.85%, #5038ED 109.55%)',
        'custom-gradient-2': 'linear-gradient(to right, #988af4, #8c7df2, #8b79f3)',
      },
      boxShadow: {
        'extra-sm': '0 1px 2px rgba(0, 0, 0, 0.05)', // Custom shadow smaller than shadow-sm
        'black-transparent': '0 4px 6px rgba(0, 0, 0, 0.2)', // Custom transparent black shadow
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '400': '400px',
        '900': "1020px",
        '128': "123px",
        '333': "32px",
        '1818': "6px",
        "6464": "64px",
      },
      margin: {
        '-16': '-25%', // You can name it as you like
      },
      animation: {
        blob: "float 20s ease-in-out infinite both alternate",
      },
      keyframes: {
        float: {
          '0%, 100%': {
            transform: 'none',
          },
          '50%': {
            transform: 'translate(50%, 20%) rotateY(10deg) scale(1.2)',
          },
        },
      },
    },
  },
  plugins: [],
}
