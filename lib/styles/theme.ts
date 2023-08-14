import { DefaultTheme } from 'styled-components/native'

const theme: DefaultTheme = {
  palette: {
    common: {
      black: '#000000',
      white: '#FFFFFF',
      lightGray: '#0000000D',
      darkGray: '#00000099',
      blue: '#332FED',
      darkBlue: '#3abeff',
      gray1: '#333333',
      gray2: '#545454',
      gray3: '#767676',
      gray4: '#989898',
      gray5: '#BABABA',
      gray6: '#F2F2F2',
      error: '#E4223B',
      iconGray: '#B3B3B3',
    },
    home: '#ffffff',
    primary: '#FFFFFF',
    primaryButton: '#00BC54',
    error: '#B00020',
    placeholderTextColor: 'rgba(0, 0, 0, 0.3)',
    unfocusedBackground: 'rgba(0, 0, 0, 0.5)',
    accentColor: '#332FED',
    accentBackground: '#332FED1A',
    background: '#F3F3F3',
  },
}

export const colorWithOpacity = (hex: string, opacity: number) => {
  const hexRegex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i
  if (!hexRegex.test(hex)) {
    return hex
  }

  if (opacity < 0 || opacity > 1) {
    return hex
  }

  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1')
  }

  const { r, g, b } = hexToRgb(hex)

  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`
  return rgbaColor
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb/11508164#11508164
const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}

export default theme
