const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  plugins: [
    require('flowbite/plugin')
  ],

  darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        primary: { 50: '#FFF5F2', 100: '#FFF1EE', 200: '#FFE4DE', 300: '#FFD5CC', 400: '#FFBCAD', 500: '#FE795D', 600: '#EF562F', 700: '#EB4F27', 800: '#CC4522', 900: '#A5371B'},
        // docs/design-system/tokens.json
        charcoal: { DEFAULT: '#33302D', raised: '#57534E' },
      },
      fontFamily: {
        sans: ['Ubuntu', 'system-ui', 'sans-serif'],
        mono: ['"Ubuntu Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        header: '0 2px 8px rgba(0, 0, 0, 0.18)',
      }
    }
  }
};

module.exports = config;