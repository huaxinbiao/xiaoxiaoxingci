<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchStats } from '../api';

const error = ref('');
const stats = ref<Record<string, any> | null>(null);

onMounted(async () => {
  try {
    stats.value = await fetchStats();
  } catch (item) {
    error.value = item instanceof Error ? item.message : '加载失败';
  }
});
</script>

<template>
  <div v-if="error" class="banner">{{ error }}</div>
  <div v-else-if="stats" class="cards">
    <div class="card"><span class="muted">累计安装</span><strong>{{ stats.totalInstalls }}</strong></div>
    <div class="card"><span class="muted">7 日活跃</span><strong>{{ stats.active7d }}</strong></div>
    <div class="card"><span class="muted">30 日活跃</span><strong>{{ stats.active30d }}</strong></div>
    <div class="card"><span class="muted">已禁用</span><strong>{{ stats.blockedInstalls }}</strong></div>
    <div class="card"><span class="muted">Android</span><strong>{{ stats.android }}</strong></div>
    <div class="card"><span class="muted">iOS</span><strong>{{ stats.ios }}</strong></div>
  </div>
  <div v-if="stats" class="row" style="margin-top: 16px">
    <div class="panel">
      <h3>版本分布</h3>
      <p v-for="item in stats.versions" :key="item.name" class="muted">{{ item.name }} · {{ item.n }}</p>
      <p v-if="!stats.versions?.length" class="muted">暂无</p>
    </div>
    <div class="panel">
      <h3>语言 / 机型</h3>
      <p v-for="item in stats.languages" :key="'l' + item.name" class="muted">{{ item.name }} · {{ item.n }}</p>
      <p v-for="item in stats.models" :key="'m' + item.name" class="muted">{{ item.name }} · {{ item.n }}</p>
    </div>
  </div>
</template>
