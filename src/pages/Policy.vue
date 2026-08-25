<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchApp, saveApp } from '../api';

const error = ref('');
const notice = ref('');
const form = ref({
  enabled: true,
  minVersion: '0.0.0',
  latestVersion: '1.0.0',
  disabledVersionsText: '',
  androidUrl: '',
  iosUrl: '',
  disabledMessage: { zhHans: '', zhHant: '', en: '' },
  updateMessage: { zhHans: '', zhHant: '', en: '' },
});

onMounted(async () => {
  try {
    const app = await fetchApp() as any;
    form.value = {
      enabled: app.enabled,
      minVersion: app.minVersion,
      latestVersion: app.latestVersion,
      disabledVersionsText: (app.disabledVersions || []).join(', '),
      androidUrl: app.androidUrl || '',
      iosUrl: app.iosUrl || '',
      disabledMessage: app.disabledMessage,
      updateMessage: app.updateMessage,
    };
  } catch (item) {
    error.value = item instanceof Error ? item.message : '加载失败';
  }
});

async function submit() {
  error.value = '';
  notice.value = '';
  try {
    await saveApp({
      enabled: form.value.enabled,
      minVersion: form.value.minVersion,
      latestVersion: form.value.latestVersion,
      disabledVersions: form.value.disabledVersionsText
        .split(/[,，\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
      androidUrl: form.value.androidUrl.trim(),
      iosUrl: form.value.iosUrl.trim(),
      disabledMessage: form.value.disabledMessage,
      updateMessage: form.value.updateMessage,
    });
    notice.value = '已保存。App 下次检查状态时生效。';
  } catch (item) {
    error.value = item instanceof Error ? item.message : '保存失败';
  }
}
</script>

<template>
  <div class="panel">
    <div v-if="error" class="banner">{{ error }}</div>
    <div v-if="notice" class="banner">{{ notice }}</div>
    <label><input v-model="form.enabled" type="checkbox" /> 应用启用（关闭则全部停用）</label>
    <div class="row">
      <div>
        <label>最低版本（低于此版本强制升级）</label>
        <input v-model="form.minVersion" placeholder="1.0.0" />
      </div>
      <div>
        <label>最新版本（低于此版本提示升级）</label>
        <input v-model="form.latestVersion" placeholder="1.1.0" />
      </div>
    </div>
    <label>禁用版本（逗号分隔，这些版本不可运行）</label>
    <input v-model="form.disabledVersionsText" placeholder="1.0.1, 1.0.2" />
    <div class="row">
      <div>
        <label>Android 升级地址（外部浏览器打开）</label>
        <input v-model="form.androidUrl" placeholder="https://play.google.com/store/apps/details?id=..." />
      </div>
      <div>
        <label>iOS 升级地址（外部浏览器打开）</label>
        <input v-model="form.iosUrl" placeholder="https://apps.apple.com/app/id..." />
      </div>
    </div>
    <div class="row">
      <div>
        <label>禁用文案 简中 / 繁中 / 英</label>
        <input v-model="form.disabledMessage.zhHans" />
        <input v-model="form.disabledMessage.zhHant" />
        <input v-model="form.disabledMessage.en" />
      </div>
      <div>
        <label>升级文案 简中 / 繁中 / 英</label>
        <input v-model="form.updateMessage.zhHans" />
        <input v-model="form.updateMessage.zhHant" />
        <input v-model="form.updateMessage.en" />
      </div>
    </div>
    <p class="muted">App 点「去更新」会用系统浏览器打开对应平台地址，不会在应用内下载安装包。</p>
    <div class="toolbar">
      <button class="primary" type="button" @click="submit">保存策略</button>
    </div>
  </div>
</template>
