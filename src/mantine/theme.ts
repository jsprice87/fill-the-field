import { MantineThemeOverride, createTheme } from '@mantine/core';

// Import our existing design tokens to avoid duplication
export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'brand',
  
  colors: {
    // Map our existing primary colors from Tailwind config
    brand: [
      '#ECFDF5', // primary-50
      '#D1FAE5', // primary-100
      '#A7F3D0', // primary-200
      '#6EE7B7', // primary-300
      '#34D399', // primary-400
      '#10B981', // primary-500 (our main brand color)
      '#059669', // primary-600
      '#047857', // primary-700
      '#065F46', // primary-800
      '#064E3B'  // primary-900
    ],
    // Keep Mantine's default gray scale for consistency with our tokens
    gray: [
      '#F9FAFB', // gray-50
      '#F3F4F6', // gray-100
      '#E5E7EB', // gray-200
      '#D1D5DB', // gray-300
      '#9CA3AF', // gray-400
      '#6B7280', // gray-500
      '#4B5563', // gray-600
      '#374151', // gray-700
      '#1F2937', // gray-800
      '#111827'  // gray-900
    ],
    // Error, warning, success colors matching our tokens
    red: [
      '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171',
      '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'
    ],
    yellow: [
      '#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24',
      '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'
    ],
    green: [
      '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80',
      '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D'
    ]
  },

  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontFamilyMonospace: 'Menlo, ui-monospace, monospace',
  
  headings: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '30px', lineHeight: '36px' },
      h2: { fontSize: '24px', lineHeight: '32px' },
      h3: { fontSize: '20px', lineHeight: '28px' },
      h4: { fontSize: '18px', lineHeight: '26px' },
      h5: { fontSize: '16px', lineHeight: '24px' },
      h6: { fontSize: '14px', lineHeight: '20px' }
    }
  },

  fontSizes: {
    xs: '12px',
    sm: '14px', // body-sm
    md: '16px', // body-lg
    lg: '18px',
    xl: '20px'
  },

  defaultRadius: 'md',
  radius: {
    xs: '4px',
    sm: '6px', 
    md: '8px',
    lg: '12px',
    xl: '16px'
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px'
  },

  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },

  components: {
    Button: {
      defaultProps: {
        size: 'md'
      },
      styles: (theme) => ({
        root: {
          minHeight: '44px',
          minWidth: '44px',
          transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            transform: 'translateY(-0.5px)',
            boxShadow: theme.shadows.md
          }
        }
      })
    },
    
    TextInput: {
      defaultProps: {
        size: 'md'
      },
      styles: (theme) => ({
        input: {
          minHeight: '44px',
          transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
          '&:focus': {
            borderColor: theme.colors.brand[5],
            boxShadow: `0 0 0 2px ${theme.colors.brand[5]}40`
          }
        }
      })
    },

    Textarea: {
      defaultProps: {
        size: 'md'
      },
      styles: (theme) => ({
        input: {
          minHeight: '80px',
          transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
          '&:focus': {
            borderColor: theme.colors.brand[5],
            boxShadow: `0 0 0 2px ${theme.colors.brand[5]}40`
          }
        }
      })
    },

    Badge: {
      styles: (theme) => ({
        root: {
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase'
        }
      })
    }
  }
});


export const mantineEmotionCache = createEmotionCache({ 
  key: 'ftf' 
});
