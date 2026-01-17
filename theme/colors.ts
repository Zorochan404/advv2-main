export const palette = {
    orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316', // Primary Brand Color
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        950: '#431407',
    },
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712',
    },
    white: '#FFFFFF',
    black: '#000000',
    red: {
        500: '#ef4444',
    },
    green: {
        500: '#22c55e',
    },
} as const;

export const colors = {
    // Brand Colors

    light: {
        muted: "#E5E7EB", // gray-200
        primary: palette.orange[500],
        onPrimary: palette.white,
        background: palette.gray[50],
        surface: palette.white,
        text: palette.gray[900],
        textSecondary: palette.gray[500],
        border: palette.gray[200],
        error: palette.red[500],
        success: palette.green[500],
    },
    dark: {
        muted: "#1F2937", // gray-800
        primary: palette.orange[500],
        onPrimary: palette.white,
        background: palette.gray[950],
        surface: palette.gray[900],
        text: palette.gray[50],
        textSecondary: palette.gray[400],
        border: palette.gray[800],
        error: palette.red[500],
        success: palette.green[500],
    },
    primary: {
        DEFAULT: "var(--color-primary-500)",
        50: "var(--color-primary-50)",
        100: "var(--color-primary-100)",
        200: "var(--color-primary-200)",
        300: "var(--color-primary-300)",
        400: "var(--color-primary-400)",
        500: "var(--color-primary-500)",
        600: "var(--color-primary-600)",
        700: "var(--color-primary-700)",
        800: "var(--color-primary-800)",
        900: "var(--color-primary-900)",
        foreground: "var(--color-primary-foreground)",
    },

    // Semantic Colors
    background: "var(--background)",
    foreground: "var(--foreground)",

    card: {
        DEFAULT: "var(--card)",
        foreground: "var(--card-foreground)",
    },

    popover: {
        DEFAULT: "var(--popover)",
        foreground: "var(--popover-foreground)",
    },

    muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)",
    },

    accent: {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)",
    },

    destructive: {
        DEFAULT: "var(--destructive)",
        foreground: "var(--destructive-foreground)",
    },

    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",
};
