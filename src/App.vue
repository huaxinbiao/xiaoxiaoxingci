<script setup lang="ts">
import { ref } from 'vue';
import { clearAdminSession, hasAdminSession } from './api';
import Overview from './pages/Overview.vue';
import Policy from './pages/Policy.vue';
import Installs from './pages/Installs.vue';
import Login from './pages/Login.vue';

const tab = ref<'overview' | 'policy' | 'installs'>('overview');
const signedIn = ref(hasAdminSession());

function onLogin() {
  signedIn.value = true;
}

function logout() {
  clearAdminSession();
  signedIn.value = false;
}
</script>

<template>
  <Login v-if="!signedIn" @success="onLogin" />
  <div v-else class="page">
    <h1>小小星词运维</h1>
    <p class="muted">应用标识 nb.tbaba.com · 安装上报、禁用与升级策略</p>
    <div class="nav">
      <button :class="{ active: tab === 'overview' }" type="button" @click="tab = 'overview'">总览</button>
      <button :class="{ active: tab === 'policy' }" type="button" @click="tab = 'policy'">策略</button>
      <button :class="{ active: tab === 'installs' }" type="button" @click="tab = 'installs'">安装</button>
      <button type="button" @click="logout">退出</button>
    </div>
    <Overview v-if="tab === 'overview'" />
    <Policy v-else-if="tab === 'policy'" />
    <Installs v-else />
  </div>
</template>
