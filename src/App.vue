<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Overview from './pages/Overview.vue';
import Policy from './pages/Policy.vue';
import Installs from './pages/Installs.vue';

const tab = ref<'overview' | 'policy' | 'installs'>('overview');
const adminToken = ref(localStorage.getItem('adminToken') || '');

onMounted(() => {
  adminToken.value = localStorage.getItem('adminToken') || '';
});

function saveToken() {
  localStorage.setItem('adminToken', adminToken.value.trim());
}
</script>

<template>
  <div class="page">
    <h1>小小星词运维</h1>
    <p class="muted">应用标识 nb.tbaba.com · 安装上报、禁用与升级策略</p>
    <label>后台令牌（设置了 ADMIN_TOKEN 时需要）</label>
    <div class="toolbar">
      <input v-model="adminToken" placeholder="可选，写入 Pages 的 ADMIN_TOKEN" />
      <button class="ghost" type="button" @click="saveToken">保存</button>
    </div>
    <div class="nav">
      <button :class="{ active: tab === 'overview' }" type="button" @click="tab = 'overview'">总览</button>
      <button :class="{ active: tab === 'policy' }" type="button" @click="tab = 'policy'">策略</button>
      <button :class="{ active: tab === 'installs' }" type="button" @click="tab = 'installs'">安装</button>
    </div>
    <Overview v-if="tab === 'overview'" />
    <Policy v-else-if="tab === 'policy'" />
    <Installs v-else />
  </div>
</template>
