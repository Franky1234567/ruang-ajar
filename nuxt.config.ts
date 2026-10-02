// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || '',
    aiMonthlyLimit: process.env.AI_MONTHLY_LIMIT || '100',
    aiMonthlyLimitPaid: process.env.AI_MONTHLY_LIMIT_PAID || '1000',
    superadminEmails: process.env.SUPERADMIN_EMAILS || '',
    public: {
      contactWa: process.env.CONTACT_WA || ''
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  // Font cadangan otomatis (Segoe UI dkk) punya glyph Arab dan nyerobot sebelum font Arab kita, jadi dimatiin.
  // (defaults.fallbacks: [] nggak ngaruh — array-nya digabung defu sama daftar bawaan.)
  fonts: {
    defaults: { weights: [400, 500, 600, 700, 800] },
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', fallbacks: [] },
      // didefinisikan sendiri di main.css (butuh size-adjust)
      { name: 'Arab', provider: 'none' }
    ]
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
