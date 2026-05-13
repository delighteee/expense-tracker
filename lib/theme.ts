import { createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: '#E1F5EE' },
          100: { value: '#B3E5D2' },
          200: { value: '#80D0B3' },
          300: { value: '#4DBB93' },
          400: { value: '#26A87B' },
          500: { value: '#0F6E56' },
          600: { value: '#0C5E49' },
          700: { value: '#0a5240' },
          800: { value: '#073D30' },
          900: { value: '#042820' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast:  { value: { _light: 'white',               _dark: 'white'               } },
          fg:        { value: { _light: '{colors.brand.700}',   _dark: '{colors.brand.300}'  } },
          subtle:    { value: { _light: '{colors.brand.50}',    _dark: '{colors.brand.900}'  } },
          muted:     { value: { _light: '{colors.brand.100}',   _dark: '{colors.brand.800}'  } },
          emphasized:{ value: { _light: '{colors.brand.300}',   _dark: '{colors.brand.700}'  } },
          solid:     { value: { _light: '{colors.brand.600}',   _dark: '{colors.brand.600}'  } },
          focusRing: { value: { _light: '{colors.brand.500}',   _dark: '{colors.brand.500}'  } },
          border:    { value: { _light: '{colors.brand.500}',   _dark: '{colors.brand.400}'  } },
        },
      },
    },
  },
});

export default system;
