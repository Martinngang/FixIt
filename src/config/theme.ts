export const THEME = {
  // Light theme colors
  light: {
    background: '#F8FAFC',
    foreground: '#1E293B',
    card: '#FFFFFF',
    'muted-foreground': '#64748B',
    primary: '#2563EB',
    border: '#E2E8F0',
    muted: '#F1F5F9',
    destructive: '#EF4444',
    'destructive-foreground': '#FFFFFF',
    // Status colors
    'yellow-100': '#FEF9C3',
    'yellow-200': '#FEF08A',
    'yellow-600': '#EAB308',
    'yellow-800': '#CA8A04',
    'yellow-900': '#A16207',
    'blue-100': '#DBEAFE',
    'blue-200': '#BFDBFE',
    'blue-400': '#60A5FA',
    'blue-600': '#2563EB',
    'blue-800': '#1E40AF',
    'blue-900': '#1E3A8A',
    'green-100': '#DCFCE7',
    'green-200': '#BBF7D0',
    'green-400': '#4ADE80',
    'green-600': '#22C55E',
    'green-800': '#15803D',
    'green-900': '#166534',
    'red-100': '#FEE2E2',
    'red-200': '#FECACA',
    'red-800': '#991B1B',
    'red-900': '#7F1D1D',
    'gray-100': '#F3F4F6',
    'gray-200': '#E5E7EB',
    'gray-800': '#1F2A44',
  },
  // Dark theme colors
  dark: {
    background: '#0F172A',
    foreground: '#F1F5F9',
    card: '#1E293B',
    'muted-foreground': '#94A3B8',
    primary: '#3B82F6',
    border: '#334155',
    muted: '#1E293B',
    destructive: '#DC2626',
    'destructive-foreground': '#F1F5F9',
    // Status colors
    'yellow-100': '#FEF9C3',
    'yellow-200': '#FEF08A',
    'yellow-600': '#EAB308',
    'yellow-800': '#CA8A04',
    'yellow-900': '#A16207',
    'blue-100': '#DBEAFE',
    'blue-200': '#BFDBFE',
    'blue-400': '#60A5FA',
    'blue-600': '#2563EB',
    'blue-800': '#1E40AF',
    'blue-900': '#1E3A8A',
    'green-100': '#DCFCE7',
    'green-200': '#BBF7D0',
    'green-400': '#4ADE80',
    'green-600': '#22C55E',
    'green-800': '#15803D',
    'green-900': '#166534',
    'red-100': '#FEE2E2',
    'red-200': '#FECACA',
    'red-800': '#991B1B',
    'red-900': '#7F1D1D',
    'gray-100': '#1F2A44',
    'gray-200': '#2D3748',
    'gray-800': '#D1D5DB',
  }
};

// Helper function to get theme colors
export const getThemeColors = (isDark: boolean) => {
  return isDark ? THEME.dark : THEME.light;
};

// CSS custom properties for themes
export const generateThemeCSS = (isDark: boolean) => {
  const colors = getThemeColors(isDark);
  const cssVars = Object.entries(colors)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

  return `:root {\n${cssVars}\n}`;
};