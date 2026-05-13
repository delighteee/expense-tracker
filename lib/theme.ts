import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E1F5EE',
      100: '#B3E5D2',
      200: '#80D0B3',
      300: '#4DBB93',
      400: '#26A87B',
      500: '#0F6E56',
      600: '#0C5E49',
      700: '#0a5240',
      800: '#073D30',
      900: '#042820',
    },
  },
  fonts: {
    body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sizes: {
    mobile: '480px',
  },
  components: {
    Input: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
    Select: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
    Button: {
      defaultProps: { colorScheme: 'brand' },
    },
  },
});

export default theme;
