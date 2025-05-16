<template>
  <div style="padding: 10px">
    <n-steps v-model:current="current" :status="currentStatus">
      <n-step title="配置数据库" description="链接数据库,获取数据结构" />
      <n-step title="选择数据表" description="选择所需数据结构生成报表" />
      <n-step title="选择列配置" />
      <n-step title="生成报表" />
      <n-step title="完成" />
    </n-steps>

    <n-form :show-label="false" :show-feedback="false">
      <div v-if="current === 1">
        <n-form-item style="margin-bottom: 10px;" show-label label="Host">
          <n-input v-model:value="sql.host" />
        </n-form-item>
        <n-form-item style="margin-bottom: 10px;" show-label label="Port">
          <n-input v-model:value="sql.port" />
        </n-form-item>
        <n-form-item style="margin-bottom: 10px;" show-label label="UserName">
          <n-input v-model:value="sql.userName" />
        </n-form-item>
        <n-form-item style="margin-bottom: 10px;" show-label label="Password">
          <n-input v-model:value="sql.password" type="password" />
        </n-form-item>
        <n-form-item style="margin-bottom: 10px;" show-label label="Database">
          <n-input v-model:value="sql.database" />
        </n-form-item>
      </div>
      <div v-else-if="current === 3">
        <n-form-item style="margin-bottom: 10px">
          <vxe-grid :data="configForm.columns" :columns="[
            { field: 'field', title: '字段名', width: 200 },
            { field: 'title', title: '标题', width: 200 },
            { type: 'radio', title: '作为时间维度', width: 200 },
          ]" width="400" border height="400">
          </vxe-grid>
        </n-form-item>
      </div>
      <div v-else-if="current === 4">
        <Main :ai-columns="configForm.columns" />
      </div>
      <n-form-item>
        <n-space>
          <n-button type="primary" @click="onPrev">上一步</n-button>
          <n-button type="primary" @click="onNext" :loading="loading">下一步</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Main from '@/views/Main/index.vue';
import dayjs from 'dayjs';

const current = ref(1);
const currentStatus = ref('process');
const sql = ref({
  host: "",
  port: "",
  userName: "",
  password: "",
  database: ""
});

function onPrev() {
  current.value--;
  if (current.value < 1) {
    current.value = 1;
  }
}

const configForm = ref({
  columns: []
})
const loading = ref(false);
async function onNext() {
  switch (current.value) {
    case 1:
      {
        loading.value = true;
        const res = await fetch('http://localhost:3000/api/db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sql.value)
        })
        console.log(res);
        loading.value = false;
        break;
      }
    case 2:
      loading.value = true;
      const res = await fetch('http://localhost:3000/api/ai/genColumn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: sql.value
        })
      }).then(res => res.json())
      loading.value = false;

      res.columns.forEach(column => {
        switch (column.type) {
          case 'boolean':
            column.formatter = ({ cellValue }) => cellValue ? '是' : '否'
            break;
          case 'date':
            column.formatter = ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD')
            break;
        }
      })
      configForm.value.columns = res.columns.map(i => ({ ...i, width: 200 }));
      break;
  }


  current.value++;
  if (current.value > 4) {
    current.value = 4;
  }
}
</script>
