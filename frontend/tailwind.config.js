/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          blue:   '#0A84FF',
          purple: '#5E5CE6',
          violet: '#BF5AF2',
          pink:   '#FF375F',
          red:    '#FF453A',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          green:  '#30D158',
          teal:   '#5AC8FA',
          cyan:   '#32ADE6',
          gray:   { 1:'#8E8E93',2:'#AEAEB2',3:'#C7C7CC',4:'#D1D1D6',5:'#E5E5EA',6:'#F2F2F7' },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass':  '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-lg':'0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        'blue':   '0 8px 32px rgba(10,132,255,0.28)',
        'purple': '0 8px 32px rgba(94,92,230,0.28)',
        'green':  '0 8px 32px rgba(48,209,88,0.25)',
        'premium':'0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      },
      backdropBlur: {
        xs:  '4px',
        sm:  '8px',
        DEFAULT: '16px',
        md:  '24px',
        lg:  '40px',
        xl:  '60px',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease both',
        'slide-up':    'slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':    'scaleIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
        'bounce-in':   'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        'pulse-glow':  'pulseGlow 2.5s ease-in-out infinite',
        'float':       'float 3.5s ease-in-out infinite',
        'shimmer':     'shimmer 1.6s infinite',
        'page-enter':  'pageEnter 0.45s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeIn:     { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        slideUpFade:{ '0%':{ opacity:'0', transform:'translateY(20px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        scaleIn:    { '0%':{ opacity:'0', transform:'scale(0.9) translateY(-6px)' }, '100%':{ opacity:'1', transform:'scale(1) translateY(0)' } },
        bounceIn:   { '0%':{ transform:'scale(0.7)', opacity:'0' }, '60%':{ transform:'scale(1.06)' }, '100%':{ transform:'scale(1)', opacity:'1' } },
        pulseGlow:  { '0%,100%':{ boxShadow:'0 0 0 0 rgba(10,132,255,0.4)' }, '50%':{ boxShadow:'0 0 0 12px rgba(10,132,255,0)' } },
        float:      { '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-8px)' } },
        shimmer:    { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        pageEnter:  { '0%':{ opacity:'0', transform:'translateY(16px) scale(0.99)' }, '100%':{ opacity:'1', transform:'translateY(0) scale(1)' } },
      },
    },
  },
  plugins: [],
};
