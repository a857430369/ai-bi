<template>
  <div style="padding: 10px">
    <n-steps :current="current" :status="currentStatus">
      <n-step
        title="输入SQL语句"
        description="根据SQL语句生成列配置"
      />
      <n-step
        title="选择列配置"
      />
      <n-step
        title="生成报表"
      />
      <n-step
        title="完成"
      />
    </n-steps>

    <n-form :show-label="false" :show-feedback="false">
      <n-form-item style="margin-bottom: 10px">
        <n-input v-model:value="sql" :rows="10" type="textarea" placeholder="请输入SQL语句" />
      </n-form-item>
      <n-form-item>
        <n-space>
          <n-button type="primary" @click="onPrev">上一步</n-button>
          <n-button type="primary" @click="onNext">下一步</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const current = ref(1);
const currentStatus = ref('process');
const sql = ref('');

function onPrev(){
  current.value--;
  if(current.value<1){
    current.value = 1;
  }
}
function onNext(){
  current.value++;
  if(current.value>4){
    current.value = 4;
  }
}
</script>


