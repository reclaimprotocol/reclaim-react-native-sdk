import 'styled-components/native'

declare module 'styled-components' {
  export interface DefaultTheme {
    palette: {
      common: {
        black: string
        white: string
        lightGray: string
        darkGray: string
        blue: string
        darkBlue: string
        gray1: string
        gray2: string
        gray3: string
        gray4: string
        gray5: string
        gray6: string
        error: string
        iconGray: string
      }
      home: string
      primary: string
      primaryButton: string
      placeholderTextColor: string
      unfocusedBackground: string
      error: string
      accentColor: string
      accentBackground: string
      background: string
    }
  }
}
