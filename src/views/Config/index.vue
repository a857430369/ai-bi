<script lang="ts" setup>
import { ref, computed } from "vue";
import { VxeGridPropTypes } from "vxe-pc-ui";
import { format } from 'sql-formatter';

const commonCols = () => [
  { field: 'desc', title: '描述' },
  { field: 'name', title: '表名' },
  { field: 'mainField', title: '主字段', formatter: ({ row }) => row.mainField.join(',') },
]

const columns1 = ref<VxeGridPropTypes.Column[]>([
  { type: 'radio', width: 50 },
  ...commonCols(),
  { title: "操作", slots: { default: 'action' }, width: 78, align: 'center' }
]);
const columns2 = ref<VxeGridPropTypes.Column[]>([
  { type: 'checkbox', width: 50 },
  ...commonCols(),
  { title: "操作", slots: { default: 'action' }, width: 78, align: 'center' }
]);
const data1 = ref([{ desc: '订单表', name: 'sales_records', mainField: ['_id'] }]);
const data2 = ref([{ desc: '产品表', name: 'products', mainField: ['_id'] }, { desc: '客户表', name: 'customers', mainField: ['_id'] }]);
const showModal = ref(false);
const loadingModal = ref(false);
const currentRow = ref();
const onShowModal = async (row) => {
  showModal.value = true
  loadingModal.value = true
  currentRow.value = row;
  await new Promise<void>((resolve) => setTimeout(resolve, 1000))
  xTable.value.clearCheckboxRow();
  xTable.value.setCheckboxRow(fieldData.value.filter(i => row.mainField.includes(i.name)), true);
  loadingModal.value = false
}
const fieldColumns = ref<VxeGridPropTypes.Column[]>([
  { type: 'checkbox', width: 50 },
  { field: 'name', title: '字段名' },
  { field: 'type', title: '字段类型' },
  { field: 'size', title: '字段大小' }
]);

const fieldData = ref([
  { name: 'createTime', type: 'date', size: 8 },
  { name: 'productName', type: 'string', size: 255 },
  { name: 'productCode', type: 'string', size: 255 },
  { name: '_id', type: 'string', size: 36 }
]);

const xTable = ref();
const onConfirm = () => {
  currentRow.value.mainField = xTable.value.getCheckboxRecords().map((item) => item.name);
  showModal.value = false;
}

const loading = ref(false);
const onSave = async () => {
  loading.value = true
  await new Promise<void>((resolve) => setTimeout(resolve, 1000))
  loading.value = false;
}
const sql = computed(() => {
  const mainTable = data1.value[0]
  const joinTables = data2.value
  return `SELECT ${mainTable.name}.*, ${joinTables.map(t =>
    `${t.name}.*`).join(', ')}\n` +
    `FROM ${mainTable.name}\n` +
    joinTables.map(t =>
      `LEFT JOIN ${t.name} ON ${mainTable.name}.${t.name}_id = ${t.name}._id`
    ).join('\n')
})

const step = ref(0);
</script>
<template>
  <div style="display: flex;gap:5px;padding: 10px;flex-wrap: wrap;">
    <div style="width: 100%;text-align: left;">
      <vxe-button status="primary" @click="onSave" :loading="loading">
        保存
      </vxe-button>
      <vxe-button @click="step--">上一步</vxe-button>
      <vxe-button @click="step++">下一步</vxe-button>
    </div>

    <template v-if="step === 0">
      <div style="flex:0.5;border: 1px solid #ccc;padding: 10px;">
        <div>主表</div>
        <div style="display: block;background-color: #ccc;height: 1px;margin: 10px 0;"></div>
        <vxe-grid :columns="columns1" :data="data1" :checkbox-config="{ showHeader: false }">
          <template #action="{ row }">
            <vxe-button mode="text" status="primary" @click="onShowModal(row)">
              选择
            </vxe-button>
          </template>
        </vxe-grid>
      </div>
      <div style="flex:1.5;border: 1px solid #ccc;padding: 10px;">
        <div>副表</div>
        <div style="display: block;background-color: #ccc;height: 1px;margin: 10px 0;"></div>
        <vxe-grid :columns="columns2" :data="data2">
          <template #action="{ row }">
            <vxe-button mode="text" status="primary" @click="onShowModal(row)">
              选择
            </vxe-button>
          </template>
        </vxe-grid>
      </div>
      <div style="border: 1px solid #ccc;width: 100%;padding: 10px;">
        <div style="margin-bottom: 5px;">
          生成的SQL:
        </div>
        <div style="white-space: pre-wrap;border: 1px solid #ccc;padding: 10px;">
          {{ format(sql) }}
        </div>
      </div>

      <vxe-modal v-model="showModal" title="选择字段" show-footer resize show-zoom>
        <vxe-grid ref="xTable" :columns="fieldColumns" :data="fieldData" :loading="loadingModal"></vxe-grid>
        <template #footer>
          <vxe-button status="primary" @click="onConfirm">确定</vxe-button>
        </template>
      </vxe-modal>
    </template>
    <template v-else-if="step == 1">
      <div>
        测试生成SQL
      </div>
    </template>
  </div>
</template>