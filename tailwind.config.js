const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
let plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/layouts/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-poppins)', ...fontFamily.sans],
            },
            animation: {
                "skeleton": "skeleton 1s ease-in-out infinite",
                "spinner": "spinner 1.4s ease-in-out infinite",
                "spin-slow": "spin 2s linear infinite",
                "shake": "shake 0.4s linear",
            },
            keyframes: {
                "skeleton": {
                    "0%": {
                        transform: "translateX(-100%)",
                        opacity: 0,
                    },
                    "50%": {
                        opacity: 1,
                    },
                    "100%": {
                        transform: "translateX(100%)",
                        opacity: 0,
                    }
                },
                "spinner": {
                    "0%": {
                        "stroke-dasharray": "1,200",
                        "stroke-dashoffset": "0",
                    },
                    "50%": {
                        "stroke-dasharray": "100,200",
                        "stroke-dashoffset": "-15px",
                    },
                    "100%": {
                        "stroke-dasharray": "100,200",
                        "stroke-dashoffset": "-113.097px",
                    }
                },
                "shake": {
                    "0%, 20%, 40%, 60%, 80%": {
                        transform: "translateX(5px)",
                    },
                    "10%, 30%, 50%, 60%, 90%": {
                        transform: "translateX(-5px)",
                    },
                    "100%": {
                        transform: "translateX(0)",
                    }
                }
            },
            colors: {
                gray: {
                    ...colors.slate,
                    1000: "#0e1424"
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        plugin(({ addVariant }) => {
            addVariant('hocus', ['&:hover', '&:focus'])
            addVariant('hocus-within', ['&:hover', '&:focus-witihin'])
            addVariant('hocus-visible', ['&:hover', '&:focus-visible'])
        }),
    ],
}
