import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#0E1217',
          surface: '#141A22',
          primary: '#00E5A8',
          secondary: '#00C2FF',
          info: '#8AB4F8',
          warning: '#F4C152',
          error: '#FF6B6B',
          success: '#22C55E'
        }
      }
    }
  },
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } }
})
