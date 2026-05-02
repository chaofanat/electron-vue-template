<template>
  <div class="settings">
    <div class="settings-header">
      <button @click="goBack" class="back-button">← 返回</button>
      <h1>设置</h1>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <h2>外观</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">主题</span>
            <span class="setting-desc">选择应用主题</span>
          </div>
          <select v-model="settings.theme" @change="saveSettings">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="system">跟随系统</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h2>行为</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">启动行为</span>
            <span class="setting-desc">应用启动时的窗口状态</span>
          </div>
          <select v-model="settings.startupBehavior" @change="saveSettings">
            <option value="restore">恢复上次状态</option>
            <option value="default">默认大小</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">关闭时最小化到托盘</span>
            <span class="setting-desc">点击关闭按钮时隐藏到系统托盘而非退出</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.closeToTray" @change="saveSettings" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h2>更新</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">自动更新</span>
            <span class="setting-desc">有新版本时自动下载更新</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settings.autoUpdate" @change="saveSettings" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h2>关于</h2>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">应用版本</span>
            <span class="setting-desc">{{ appVersion }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';

const router = useRouter();
const appVersion = ref('');
const { theme, setTheme } = useTheme();

const settings = ref({
  theme: 'system' as 'light' | 'dark' | 'system',
  startupBehavior: 'restore',
  closeToTray: true,
  autoUpdate: true,
});

// 监听主题变化
watch(() => settings.value.theme, (newTheme) => {
  setTheme(newTheme);
});

onMounted(async () => {
  if (window.electronAPI) {
    // 加载应用版本
    appVersion.value = await window.electronAPI.app.getVersion();

    // 加载主题设置
    const savedTheme = await window.electronAPI.store.get<string>('user.preferences.theme');
    if (savedTheme) {
      settings.value.theme = savedTheme as any;
    }

    // 加载应用设置
    const appSettings = await window.electronAPI.store.get<any>('app.settings');
    if (appSettings) {
      settings.value.closeToTray = appSettings.closeToTray ?? true;
      settings.value.autoUpdate = appSettings.autoUpdate ?? true;
    }

    // 加载启动行为
    const startupBehavior = await window.electronAPI.store.get<string>('user.preferences.startupBehavior');
    if (startupBehavior) {
      settings.value.startupBehavior = startupBehavior;
    }
  }
});

const saveSettings = async () => {
  if (window.electronAPI) {
    // 保存主题设置
    await window.electronAPI.store.set('user.preferences.theme', settings.value.theme);
    await window.electronAPI.store.set('user.preferences.startupBehavior', settings.value.startupBehavior);

    // 保存应用设置
    await window.electronAPI.store.set('app.settings.closeToTray', settings.value.closeToTray);
    await window.electronAPI.store.set('app.settings.autoUpdate', settings.value.autoUpdate);

    await window.electronAPI.log.info('设置已保存');
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.settings {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-button {
  background: none;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text-color);
}

.back-button:hover {
  background: var(--bg-color-secondary);
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text-color);
}

.settings-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.settings-section h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: var(--text-color);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-weight: 500;
  color: var(--text-color);
}

.setting-desc {
  font-size: 13px;
  color: var(--text-color-secondary);
}

select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
  color: var(--text-color);
  min-width: 150px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #409eff;
}

input:checked + .slider:before {
  transform: translateX(22px);
}
</style>
