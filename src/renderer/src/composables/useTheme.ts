import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark' | 'system';

const theme = ref<Theme>('system');
const isDark = ref(false);

export function useTheme() {
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark.value = newTheme === 'dark';
    }

    root.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    applyTheme(newTheme);

    // 保存到存储
    if (window.electronAPI) {
      window.electronAPI.store.set('user.preferences.theme', newTheme);
    }
  };

  const loadTheme = async () => {
    if (window.electronAPI) {
      const savedTheme = await window.electronAPI.store.get<Theme>('user.preferences.theme');
      if (savedTheme) {
        theme.value = savedTheme;
      }
    }
    applyTheme(theme.value);
  };

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme('system');
    }
  });

  onMounted(() => {
    loadTheme();
  });

  return {
    theme,
    isDark,
    setTheme,
    loadTheme,
  };
}
