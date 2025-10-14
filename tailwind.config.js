module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                twitter: '#1DA1F2',
                facebook: '#1877F2',
                instagram: '#e6683c',
                linkedin: '#0077B5',
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                }
            },
            fontFamily: {
                'inter': ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in',
                'slide-in': 'slideIn 0.3s ease-out',
            }
        },
    },
    plugins: [],
}