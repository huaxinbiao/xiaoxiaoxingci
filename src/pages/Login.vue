<script setup lang="ts">
import { ref } from 'vue';
import { login } from '../api';

const emit = defineEmits<{ success: [] }>();
const username = ref('admin_user');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await login(username.value.trim(), password.value);
    emit('success');
  } catch (item) {
    error.value = item instanceof Error ? item.message : '登录失败';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="panel" style="max-width: 420px; margin: 12vh auto 0">
      <h1>小小星词运维</h1>
      <p class="muted">请使用管理员账号登录</p>
      <div v-if="error" class="banner">{{ error }}</div>
      <label>用户名</label>
      <input v-model="username" autocomplete="username" />
      <label>密码</label>
      <input v-model="password" type="password" autocomplete="current-password" @keyup.enter="submit" />
      <div class="toolbar">
        <button class="primary" type="button" :disabled="loading" @click="submit">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </div>
    </div>
  </div>
</template>
