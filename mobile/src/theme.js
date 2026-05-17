import { Platform } from "react-native";

export const colors = {
  background: "#EFE4D1",
  surface: "#FFF8EA",
  surfaceMuted: "#F1E6D5",
  surfaceSoft: "#F5EDDF",
  line: "#E4D8C4",
  ink: "#172126",
  inkMuted: "#617077",
  teal: "#102023",
  tealSoft: "#E8F3ED",
  green: "#2A9D8F",
  coral: "#D86D50",
  coralSoft: "#FCE9DD",
  cream: "#FFF4DE",
  white: "#FFFFFF"
};

export const fonts = {
  display: Platform.select({
    ios: "Didot",
    android: "serif",
    default: "serif"
  }),
  text: Platform.select({
    ios: "Avenir Next",
    android: "sans-serif",
    default: undefined
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace"
  })
};

export const shadow = {
  shadowColor: "#332618",
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.14,
  shadowRadius: 26
};
