import { MantineThemeOverride } from '@mantine/core';

// Read color values from Tailwind config to avoid duplication
export const theme: MantineThemeOverride = {
  primaryColor: 'primary',
  colors: {
    // Map our existing primary colors from Tailwind config
    primary: [
      '#ECFDF5', // primary-50
      '#D1FAE5', 
      '#A7F3D0', 
      '#6EE7B7', 
      '#34D399', 
      '#10B981', // primary-500 (our main brand color)
      '#059669', // primary-600
      '#047857', // primary-700
      '#065F46', 
      '#064E3B'
    ],
    // Keep Mantine's default gray scale for consistency
    gray: [
      '#F9FAFB', // gray-50
      '#F3F4F6', // gray-100
      '#E5E7EB',
      '#D1D5DB',
      '#9CA3AF',
      '#6B7280',
      '#4B5563',
      '#374151', // gray-700
      '#1F2937',
      '#111827'  // gray-900
    ]
  },
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontFamilyMonospace: 'Menlo, ui-monospace, monospace',
  headings: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md', // 8px
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
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md'
      }
    },
    TextInput: {
      defaultProps: {
        size: 'md'
      }
    }
  }
};
