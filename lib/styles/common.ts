import styled, { css } from 'styled-components/native'
import theme, { colorWithOpacity } from './theme'

export const flexRow = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`

export const FlexRow = styled.View<{ gap?: string; key?: number | string }>`
  ${flexRow}
  gap: ${(props) => props.gap ?? '0px'};
  key: ${(props) => props.key ?? '0'};
`

export const FlexColumn = styled.View<{ gap?: string; alignItems?: string }>`
  ${flexColumn}
  gap: ${(props) => props.gap ?? '0px'};
  align-items: ${(props) => props.alignItems ?? 'flex-start'};
`

export const flex1 = css`
  flex: 1;
`

export const absoluteFill = css`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

// Typography

export const manropeFont = css`
  font-family: 'Manrope';
  font-style: normal;
`

export const font = [
  css`
    font-size: 32px;
  `,
  css`
    font-size: 20px;
  `,
  css`
    font-size: 13px;
  `,
  css`
    font-size: 15px;
  `,
  css`
    font-size: 17px;
  `,
  css`
    font-size: 24px;
  `,
]

export const H1 = styled.Text`
  ${manropeFont}
  font-weight: 700;
  ${font[0]}
  line-height: 44px;
  color: ${(props) => props.theme.palette.common.black};
`

export const H2 = styled.Text<{ color?: string }>`
  ${manropeFont}
  font-weight: 700;
  ${font[1]}
  line-height: 24px;
  color: ${({ color, theme }) => color ?? theme.palette.common.black};
`

export const H3 = styled.Text<{ color?: string; weight?: string; textAlign?: string }>`
  ${manropeFont}
  font-weight: ${(props) => props.weight ?? 400};
  ${font[2]}
  line-height: 16px;
  color: ${(props) => props.color ?? props.theme.palette.common.darkGray};
  text-align: ${(props) => props.textAlign ?? 'left'};
`

export const H4 = styled.Text<{
  color?: string
  weight?: string
  fontSize?: string
  lineHeight?: string
}>`
  ${manropeFont}
  font-weight: ${(props) => props.weight ?? 400};
  font-size: ${(props) => props.fontSize ?? '13px'};
  line-height: ${(props) => props.lineHeight ?? '16px'};
  color: ${(props) => props.color ?? props.theme.palette.common.darkGray};
`

export const H5 = styled.Text<{
  color?: string
}>`
  ${manropeFont}
  font-weight: 700;
  ${font[4]};
  line-height: 20px;
  color: ${(props) => props.color ?? props.theme.palette.common.black};
`

export const ScreenTitle = styled.Text`
  ${manropeFont}
  font-weight: 700;
  ${font[4]}
  line-height: 24px;
  color: ${(props) => props.theme.palette.common.black};
`

export const BodyEmphasized = styled.Text<{ color?: string }>`
  ${manropeFont}
  font-weight: 700;
  ${font[3]}
  line-height: 16px;
  color: ${(props) => props.color ?? props.theme.palette.common.black};
`

export const WithBackground = styled.View<{ background: string }>`
  background-color: ${(props) => props.background};
`

export const Bold = styled.Text`
  font-weight: 700;
`

// Spacing

export const marginTop = [
  css`
    margin-top: 16px;
  `,
  css`
    margin-top: 24px;
  `,
  css`
    margin-top: 32px;
  `,
  css`
    margin-top: 64px;
  `,
]

export const makeMarginTopComponent = (index: number) => styled.View`
  ${marginTop[index]}
`

export const makeMarginBottomComponent = (index: number) => styled.View`
  ${marginBottom[index]}
`

export const makeMarginLeftComponent = (index: number) => styled.View`
  ${marginLeft[index]}
`

export const marginLeft = [
  css`
    margin-left: 16px;
  `,
  css`
    margin-left: 24px;
  `,
  css`
    margin-left: 32px;
  `,
  css`
    margin-left: 64px;
  `,
]

export const marginRight = [
  css`
    margin-right: 16px;
  `,
  css`
    margin-right: 24px;
  `,
  css`
    margin-right: 32px;
  `,
  css`
    margin-right: 64px;
  `,
]

export const marginBottom = [
  css`
    margin-bottom: 16px;
  `,
  css`
    margin-bottom: 24px;
  `,
  css`
    margin-bottom: 32px;
  `,
  css`
    margin-bottom: 64px;
  `,
]

export const paddingTop = [
  css`
    padding-top: 16px;
  `,
  css`
    padding-top: 24px;
  `,
  css`
    padding-top: 32px;
  `,
  css`
    padding-top: 64px;
  `,
]

export const paddingLeft = [
  css`
    padding-left: 16px;
  `,
  css`
    padding-left: 24px;
  `,
  css`
    padding-left: 32px;
  `,
  css`
    padding-left: 64px;
  `,
]

export const paddingRight = [
  css`
    padding-right: 16px;
  `,
  css`
    padding-right: 24px;
  `,
  css`
    padding-right: 32px;
  `,
  css`
    padding-right: 64px;
  `,
]

export const paddingBottom = [
  css`
    padding-bottom: 16px;
  `,
  css`
    padding-bottom: 24px;
  `,
  css`
    padding-bottom: 32px;
  `,
  css`
    padding-bottom: 64px;
  `,
]

export const padding = [
  css`
    padding: 16px;
  `,
  css`
    padding: 24px;
  `,
  css`
    padding: 32px;
  `,
  css`
    padding: 64px;
  `,
]
export const marginLeftAuto = css`
  margin-left: auto;
`

export const marginRightAuto = css`
  margin-right: auto;
`

export const RightView = styled.View`
  ${marginLeftAuto}
`

export const MetaActionBar = styled.View<{ 'margin-top'?: string }>`
  ${flexRow};
  justify-content: space-between;
  width: 100%;
  margin-top: ${(props) => props['margin-top'] ?? '0px'};
`

export const BodyView = styled.View`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

export const ContainerView = styled.View`
  ${paddingLeft[0]}
  ${paddingRight[0]}
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
`

export const NotificationView = styled.ScrollView`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

export const NotificationContainer = styled.Pressable`
  padding-bottom: 10px;
`

export const RequestButton = styled.Pressable`
  width: 100%;
  align-items: center;
`

export const TextInput = styled.TextInput<{ lineHeight?: string }>`
  font-weight: 800;
  ${font[5]}
  color: ${(props) => props.theme.palette.common.black};
  padding: 0px;
`

export const ClaimsContainer = styled.ScrollView`
  padding-top: 30px;
`

export const Center = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`

/** commonly used opacity colors */
export const colorBlack5 = colorWithOpacity(theme.palette.common.black, 0.05)
export const colorBlack30 = colorWithOpacity(theme.palette.common.black, 0.3)
