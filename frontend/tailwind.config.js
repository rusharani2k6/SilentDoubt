/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── SD Brand Design Tokens ──────────────────────────────────
        // Soft Pastel Cyan / Blue (Primary accent — ~10-15%)
        sd: {
          bg: '#F5F7F8',            // Slightly warmer off-white base background
          card: '#FFFFFF',          // Pure white cards
          border: '#E4E8EE',        // Subtle cool-gray borders

          // Primary: Soft Cyan
          cyan: '#9BE5E3',          // Main cyan accent
          'cyan-dark': '#3DA8A5',   // Active / hover cyan
          'cyan-darker': '#1F7A78', // Dark text on cyan
          'cyan-light': '#E6FAF9',  // Very light cyan tint (surfaces, selected states)
          'cyan-mid': '#6DD0CE',    // Mid cyan for gradients

          // Secondary: Warm Pastel Yellow / Cream
          yellow: '#F6E49F',        // Main warm yellow accent
          'yellow-dark': '#C9A830', // Active / hover yellow
          'yellow-darker': '#7A620E',// Dark text on yellow
          'yellow-light': '#FEF9E8', // Very light yellow tint (surfaces, highlights)
          'yellow-mid': '#EDCF72',  // Mid yellow for gradients

          // Neutral / Typography
          black: '#0D0F0D',         // Near-black for headings
          dark: '#3D3F4A',          // Dark gray body text
          muted: '#8A8B97',         // Muted/secondary text
          gray: '#B8BAC4',          // Subtle gray
          'light-gray': '#F0F2F5',  // Light gray surfaces

          // Semantic
          success: '#34D399',
          danger: '#F87171',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sd-xs': '0 1px 2px rgba(13,15,13,0.04)',
        'sd-sm': '0 1px 4px rgba(13,15,13,0.05), 0 1px 2px rgba(13,15,13,0.03)',
        'sd-md': '0 4px 16px rgba(13,15,13,0.06), 0 2px 6px rgba(13,15,13,0.03)',
        'sd-lg': '0 12px 32px rgba(13,15,13,0.08), 0 4px 12px rgba(13,15,13,0.04)',
        'sd-xl': '0 20px 44px rgba(13,15,13,0.10), 0 8px 18px rgba(13,15,13,0.05)',
        // Pastel colored glows for hero / featured elements
        'sd-cyan': '0 0 32px rgba(155,229,227,0.40)',
        'sd-yellow': '0 0 32px rgba(246,228,159,0.45)',
        // Backwards-compat aliases used in existing components
        'df-sm': '0 1px 4px rgba(13,15,13,0.05), 0 1px 2px rgba(13,15,13,0.03)',
        'df-md': '0 4px 16px rgba(13,15,13,0.06), 0 2px 6px rgba(13,15,13,0.03)',
        'df-lg': '0 12px 32px rgba(13,15,13,0.08), 0 4px 12px rgba(13,15,13,0.04)',
        'df-xl': '0 20px 44px rgba(13,15,13,0.10), 0 8px 18px rgba(13,15,13,0.05)',
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      backgroundImage: {
        // Main brand gradient: Warm Yellow → Neutral White → Soft Cyan
        'sd-gradient': 'linear-gradient(135deg, #F6E49F 0%, #FAFAF9 50%, #9BE5E3 100%)',
        // Hero ambient gradient
        'sd-hero': 'linear-gradient(135deg, #FEF9E8 0%, #F5F7F8 45%, #E6FAF9 100%)',
        // Subtle card gradient accent
        'sd-card-cyan': 'linear-gradient(135deg, #E6FAF9 0%, #FFFFFF 100%)',
        'sd-card-yellow': 'linear-gradient(135deg, #FEF9E8 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
