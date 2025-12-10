import { useEffect } from 'react';
import { useUserSettings } from './useUserSettings';

/**
 * Hook để quản lý theme (dark mode)
 */
export const useTheme = () => {
  const { settings, updateSetting } = useUserSettings();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const toggleDarkMode = () => {
    updateSetting('darkMode', !settings.darkMode);
  };

  return {
    isDarkMode: settings.darkMode,
    toggleDarkMode,
  };
};
