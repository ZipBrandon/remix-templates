import type { Config } from "tailwindcss";
import { blackA, mauve, violet } from '@radix-ui/colors';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

const variableColors = {
  "brand-primary-dark": `#162c43`,
  "brand-primary-light": `#0d5caa`,
  "brand-primary": `#084989`,
  "brand-accent": `#6EBB1F`,
  "brand-legible": `#FFFFFF`,
  "brand-legible-light": `#aec2e5`,
};
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        ...blackA,
        ...mauve,
        ...violet,
      },
    },
  },
  plugins: [
        addVariablesForColors,
    addVariablesForColorObject,
  ],
} satisfies Config;



function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme(`colors`));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}

function addVariablesForColorObject({ addBase, theme }) {
  let newVars = Object.fromEntries(
    Object.entries(variableColors).map(([key, val]) => {
      return [`--${key}`, val];
    }),
  );

  addBase({
    ":root": newVars,
  });
}