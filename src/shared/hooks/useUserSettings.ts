import { useState, useEffect, useCallback } from 'react';

export interface UIConfig {
  edgeColor: string;
  edgeWidth: number;
  backgroundColor: string;
  backgroundVariant: 'dots' | 'lines' | 'cross';
  nodeBorderColor: string;
  nodeHeaderColor: string;
  nodeColorTemplate: string; // ID của color template
}

export interface UserSettings {
  enableTextToSpeech: boolean;
  darkMode: boolean;
  uiConfig: UIConfig;
}

const SETTINGS_STORAGE_KEY = 'neomind_user_settings';
const DEFAULT_UI_CONFIG: UIConfig = {
  edgeColor: '#6366f1', // Indigo
  edgeWidth: 3,
  backgroundColor: '#e5e7eb', // Gray-200
  backgroundVariant: 'dots',
  nodeBorderColor: '#6366f1',
  nodeHeaderColor: '#6366f1',
  nodeColorTemplate: 'blue', // Template mặc định
};

const DEFAULT_SETTINGS: UserSettings = {
  enableTextToSpeech: true, // Mặc định bật
  darkMode: false, // Mặc định light mode
  uiConfig: DEFAULT_UI_CONFIG,
};

/**
 * Hook để quản lý user settings
 */
export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings từ localStorage khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<UserSettings>;
        // Merge với default settings và đảm bảo uiConfig có đầy đủ fields
        const mergedSettings: UserSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          uiConfig: {
            ...DEFAULT_UI_CONFIG,
            ...(parsed.uiConfig || {}),
            // Đảm bảo nodeColorTemplate có giá trị
            nodeColorTemplate:
              parsed.uiConfig?.nodeColorTemplate ||
              DEFAULT_UI_CONFIG.nodeColorTemplate,
          },
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings vào localStorage
  const saveSettings = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }, []);

  // Update một setting cụ thể
  const updateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  // Reset về default
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
  };
};
