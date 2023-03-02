import { css } from "styled-components"
import "@fontsource/plus-jakarta-sans"
import "@fontsource/barlow-condensed"
import "inter-ui/inter.css"
import "react-toastify/dist/ReactToastify.css"
import "rc-picker/assets/index.css"

// textstyles
export const title1 = css`
  font-family: "Barlow Condensed", sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
`

export const title2 = css`
  font-family: "Barlow Condensed", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 40px;
`

export const heading1 = css`
  font-family: "Barlow Condensed", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
`

export const heading2 = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
`
export const heading3 = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
`

export const heading4 = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
`

export const heading5 = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
`

export const category = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
`

export const body = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
`

export const caption = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
`
export const captionSm = css`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
`

// colors
export const steel = {
  background: "#0A171D",
  surface: "#212D36",
  mediumDark: "#2F424E",
  mediumLight: "#526B79",
  light: "#A0BCD0",
  dark: "#495158",
}

export const neutrals = {
  "1": "#F3F3F3",
  "2": "#F8F7FA",
  "3": "#C9C8CC",
  "4": "#68676A",
}

export const accents = {
  limeGreen: "#DBFF00",
  green2: "#27AE60",
  blue: "#41A4F3",
  orange2: "#FCAB3E",
  purple: "#8A77FF",
  gray: "#F2F2F2",
  lightBlue: "#E1FFFB",
  cyan: "#7BF9FA",
  gullGray: "#A5ADBB",
  errorRed: "#FF005B",
  paleBlue: "#EAEEF5",
}

export const gradients = {
  orangePink: "linear-gradient(138.99deg, #FC9150 13.99%, #FA5094 86.01%)",
}

export const white = "#FFFFFF"

export const black = "#000000"

export const red = "rgba(255, 0, 91, 1)"

export const scrollbar = css`
  /* width */
  ::-webkit-scrollbar {
    width: 8px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${steel.mediumDark};
    border-radius: 4px;
  }
`

//common styles
export const flexWrapper = css`
  display: flex;
  align-items: center;
`

export const pseudoDots = css`
  content: "";
  display: flex;
  width: 4px;
  height: 4px;
  background: ${steel.mediumLight};
  border-radius: 100%;
  margin: 0px 6px;
`
