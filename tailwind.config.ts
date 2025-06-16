
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Design System Color Tokens
				primary: {
					50: '#ECFDF5',
					500: '#10B981',
					600: '#059669',
					700: '#047857',
					DEFAULT: '#10B981',
					foreground: 'hsl(var(--primary-foreground))'
				},
				gray: {
					50: '#F9FAFB',
					100: '#F3F4F6',
					700: '#374151',
					900: '#111827',
				},
				error: {
					500: '#EF4444',
				},
				warning: {
					500: '#F59E0B',
				},
				success: {
					500: '#22C55E',
				},
				// Legacy shadcn/ui tokens
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Soccer Stars Brand Colors (preserved for /free-trial/)
				'brand-red': 'hsl(var(--brand-red))',
				'brand-navy': 'hsl(var(--brand-navy))',
				'brand-blue': 'hsl(var(--brand-blue))',
				'brand-grey': 'hsl(var(--brand-grey))',
				'brand-red-600': 'hsl(var(--brand-red-600))',
			},
			fontFamily: {
				// Design System Typography - Inter fallback ui-sans-serif
				sans: ['Inter', 'ui-sans-serif', 'system-ui'],
				// Brand fonts preserved for free-trial
				anton: ['Anton', 'sans-serif'],
				agrandir: ['Inter', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
				montserrat: ['Montserrat', 'sans-serif'],
				'barlow-condensed': ['Barlow Condensed', 'sans-serif'],
			},
			fontSize: {
				// Design System Typography Scale
				'h1': ['30px', { lineHeight: '36px', fontWeight: '600' }],
				'h2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
				'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
				'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
				'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
				'code': ['13px', { lineHeight: '20px', fontWeight: '500' }],
			},
			spacing: {
				// 4-pt grid system
				'card-lg': '24px',
				'card-sm': '16px',
				'table-cell-y': '12px',
				'table-cell-x': '16px',
				'sidebar-full': '240px',
				'sidebar-collapsed': '72px',
			},
			maxWidth: {
				'app': '1280px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			transitionDuration: {
				'ui': '200ms',
			},
			transitionTimingFunction: {
				'ui': 'cubic-bezier(0.4,0,0.2,1)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
