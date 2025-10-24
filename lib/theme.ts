"use client";

import { createTheme, MantineColorsTuple } from "@mantine/core";

// Define the "Privacy Gold" color based on your logo
const privacyGold: MantineColorsTuple = [
  "#fff8e1", // 0
  "#ffefcc", // 1
  "#ffdf9b", // 2
  "#ffcf64", // 3
  "#ffc233", // 4
  "#ffb814", // 5
  "#ffb200", // 6 (Main shade)
  "#e39b00", // 7
  "#c98800", // 8
  "#ae7400"  // 9
];

export const theme = createTheme({
  /** Put your mantine theme override here */
  colorScheme: "dark",
  primaryColor: "privacyGold",
  colors: {
    privacyGold,
  },
  fontFamily: "Inter, sans-serif",
  headings: {
    fontFamily: "Inter, sans-serif",
    fontWeight: "600",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
