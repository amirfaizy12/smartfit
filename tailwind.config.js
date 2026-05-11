  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: ["./src/**/*.{html,js}", "./node_modules/flowbite//*.js"],
    theme: {
      extend: {
        colors: {
          prime : '#206DEA',
          second : '#0d1117',
        }
      },
    },
    plugins: [require('flowbite/plugin')],
  }

