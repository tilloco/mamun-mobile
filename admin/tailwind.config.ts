import type { Config } from 'tailwindcss';

// Dizayn yo'nalishi: "rasmiy hujjat / muhr" uslubi — huquq sohasiga mos, quruq SaaS
// shablonidan farqli. To'q ko'k-siyoh (ink) sidebar + iliq brass (jez) urg'u faqat
// Premium belgisi va faol holatlar uchun. Jadval-markazli tuzilma, soyali kartalar emas.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16213E',
        inkLight: '#243158',
        paper: '#FAF8F3',
        panel: '#FFFFFF',
        line: '#E4DFD3',
        ink900: '#1C1B19',
        muted: '#756F63',
        brass: '#A9812F',
        brassLight: '#F3E8CB',
        sage: '#4B6B4F',
        sageLight: '#E7EEE3',
        rust: '#B14A3C',
        rustLight: '#F5E1DD',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
      },
    },
  },
  plugins: [],
};

export default config;
