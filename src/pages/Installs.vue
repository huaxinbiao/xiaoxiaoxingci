<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchInstalls, setBlocked } from '../api';

const error = ref('');
const query = ref('');
const manualId = ref('');
const items = ref<any[]>([]);

async function load() {
  error.value = '';
  try {
    items.value = await fetchInstalls(query.value) as any[];
  } catch (item) {
    error.value = item instanceof Error ? item.message : '加载失败';
  }
}

async function toggle(item: any, blocked: boolean) {
  try {
    await setBlocked(item.installId, blocked);
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败';
  }
}

async function blockManual() {
  try {
    await setBlocked(manualId.value.trim(), true, 'manual');
    manualId.value = '';
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败';
  }
}

onMounted(load);
</script>

<template>
  <div class="panel">
    <div v-if="error" class="banner">{{ error }}</div>
    <div class="toolbar">
      <input v-model="query" placeholder="搜索 installId" @keyup.enter="load" />
      <button class="ghost" type="button" @click="load">搜索</button>
    </div>
    <div class="toolbar">
      <input v-model="manualId" placeholder="手工粘贴 installId 并禁用" />
      <button class="danger" type="button" @click="blockManual">禁用</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>installId</th>
          <th>版本</th>
          <th>平台</th>
          <th>机型</th>
          <th>语言</th>
          <th>最近见到</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.installId">
          <td>{{ item.installId }}</td>
          <td>{{ item.appVersion }}</td>
          <td>{{ item.platform }}</td>
          <td>{{ item.deviceModel }}</td>
          <td>{{ item.appLanguage }}</td>
          <td>{{ item.lastSeen?.slice(0, 19).replace('T', ' ') }}</td>
          <td>
            <button v-if="item.blocked" class="ghost" type="button" @click="toggle(item, false)">解禁</button>
            <button v-else class="danger" type="button" @click="toggle(item, true)">禁用</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!items.length" class="muted">还没有上报记录。</p>
  </div>
</template>
