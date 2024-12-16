<script setup>
import { mockData } from './mock';
import dayjs from 'dayjs';
import { ref, nextTick, onMounted } from 'vue';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import currency from "currency.js"
import { cloneDeep, flatMap, uniq } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { VxeUI } from 'vxe-table'
// import dataJson from "./data.json"
import utc from 'dayjs/plugin/utc';
import { Chart } from '@antv/g2';
import ChartComponent from './components/chart/index.vue';

dayjs.extend(utc);
// TODO 图表功能
// TODO 横向分组无限嵌套
// TODO 需要做footer统计
// TODO 未来需要分析字段是否要做合并项目
// TODO 未来需要分析字段是否要做平均计算
// TODO 多维度合并表头
// TODO 可能创建一个新的组件做合并项数据分析

// TODO 根据创建时间进行时间分析
const FIELD_BY_TIME = "createTime"; // 该字段可动态配置
// TODO 固定第一项位置
const FIELD_FIRST = 3;
// 数据分隔符
const SPLIT_CHAR = "_";
// const mockData = () => Promise.resolve(dataJson);

dayjs.extend(weekOfYear);
// 递归展开嵌套数据
function flattenData(nodes) {
  let flatList = [];

  function recurse(node) {
    flatList.push(node);

    // 如果存在子节点，递归展开
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => recurse(child));
    }
  }

  nodes.forEach(node => recurse(node));
  return flatList;
}

const data = ref([]);
const cloneData = ref(cloneDeep(data.value));
const defaultColumns = () => [
  { title: '#', type: 'seq', width: 80 },
  { field: '_id', title: 'ID', width: 180 },
  { field: 'productName', title: '产品名称', width: 120 },
  { field: 'createTime', title: '创建时间', width: 150 },
  { field: 'productCode', title: '产品编码', width: 120 },
  { field: 'num', title: '总数', width: 120 },
  { field: 'amount', title: '总金额', width: 100 },
  { field: 'unitPrice', title: '单价', width: 100 },
  { field: 'actualPrice', title: '实际价格', width: 100 },
  { field: 'quantity', title: '数量', width: 80 },
  { field: 'discount', title: '折扣', width: 80 },
  { field: 'quotationDelay', title: '报价延迟(天)', width: 120 },
  { field: 'orderDelay', title: '下单延迟(天)', width: 120 },
  { field: 'paymentDelay', title: '付款延迟(天)', width: 120 },
  { field: 'deliveryDelay', title: '发货延迟(天)', width: 120 },
  { field: 'totalProcessDays', title: '总处理天数', width: 120 },
  { field: 'relationType', title: '关系类型', width: 120 },
  { field: 'combination', title: '组合', width: 100 },
  { field: 'region', title: '地区', width: 100 },
  { field: 'channel', title: '渠道', width: 120 },
  { field: 'paymentMethod', title: '支付方式', width: 120 },
  { field: 'status', title: '状态', width: 100 },
  { field: 'isVIP', title: '是否VIP', width: 100 },
  { field: 'isCouponUsed', title: '是否使用优惠券', width: 140, formatter: ({ cellValue }) => cellValue ? '是' : '否' },
  { field: 'isFirstPurchase', title: '是否首次购买', width: 120, formatter: ({ cellValue }) => cellValue ? '是' : '否' },
  { field: 'returnRate', title: '退货率', width: 100, formatter: ({ cellValue }) => `${currency(cellValue, { precision: 2 }).multiply(100).value}%` },
  { field: 'customerSatisfaction', title: '客户满意度', width: 120 },
  { field: 'paymentAmount', title: '付款金额', width: 100 },
  { field: 'receivedAmount', title: '收款金额', width: 100 },
  { field: 'costPrice', title: '成本价格', width: 100 },
  { field: 'profit', title: '单件利润', width: 100 },
  { field: 'totalProfit', title: '总利润', width: 100 },
  { field: 'profitMargin', title: '利润率', width: 100, formatter: ({ cellValue }) => `${currency(cellValue, { precision: 2 }).multiply(100).value}%` },
  // 客户信息列
  { field: 'customerId', title: '客户ID', width: 80 },
  { field: 'customerName', title: '客户姓名', width: 100 },
  { field: 'customerCompany', title: '公司名称', width: 160 },
  { field: 'customerEmail', title: '邮箱', width: 160 },
  { field: 'customerPhone', title: '电话', width: 120 },
  { field: 'customerType', title: '客户类型', width: 100 },
  { field: 'customerLevel', title: '会员等级', width: 100 },
  { field: 'customerAge', title: '年龄段', width: 100 },
  { field: 'customerOccupation', title: '职业', width: 100 },
  { field: 'purchaseCount', title: '购买次数', width: 100 },
  { field: 'totalSpent', title: '总消费金额', width: 120 },
  { field: 'avgOrderAmount', title: '平均订单金额', width: 120 },
  { field: 'lastPurchaseDate', title: '最近购买日期', width: 160, formatter: ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD') },
  { field: 'registrationDate', title: '注册日期', width: 160, formatter: ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD') },
  { field: 'hasReturned', title: '是否有退货', width: 100, formatter: ({ cellValue }) => cellValue ? '是' : '否' },
  { field: 'preferredPaymentMethod', title: '首选支付方式', width: 120 },
  { field: 'hasComplaints', title: '是否有投诉', width: 100, formatter: ({ cellValue }) => cellValue ? '是' : '否' },
  { field: 'recommendationScore', title: '推荐评分', width: 100 }
]
const columns = ref(defaultColumns());
const defaultCols = ref(defaultColumns());

const buttons = [
  { key: 'year', text: '按年' },
  { key: 'quarter', text: '按季度' },
  { key: 'month', text: '按月' },
  { key: 'week', text: '按周' }
];

// DateHook类用于根据时间字段对数据进行分组
class DateHook {
  constructor(data) {
    // 构造函数，接收数据作为参数
    this.data = data;
  }
  // 按年分组数据
  year() {
    let map = new Map();
    // 对数据按照时间字段排序
    this.data
      .sort((a, b) => dayjs(a[FIELD_BY_TIME]).unix() - dayjs(b[FIELD_BY_TIME]).unix())
      .forEach(item => {
        // 提取年份
        let year = dayjs.utc(item[FIELD_BY_TIME]).year();
        // 如果map中没有该年份，则添加
        if (!map.has(year)) {
          map.set(year, []);
        }
        // 将数据添加到对应年份的数组中
        map.get(year).push(item);
      });
    return map;
  }
  // 按季度分组数据
  quarter() {
    let map = new Map();
    // 对数据按照时间字段排序
    this.data.sort((a, b) => dayjs(a[FIELD_BY_TIME]).unix() - dayjs(b[FIELD_BY_TIME]).unix())
      .forEach(item => {
        // 计算季度
        let year = `${dayjs.utc(item[FIELD_BY_TIME]).year()}Q${Math.ceil(dayjs.utc(item[FIELD_BY_TIME]).month() / 3)}`;
        // 如果map中没有该季度，则添加
        if (!map.has(year)) {
          map.set(year, []);
        }
        // 将数据添加到对应季度的数组中
        map.get(year).push(item);
      });
    return map;
  }
  // 按月分组数据
  month() {
    let map = new Map();
    // 对数据按照时间字段排序
    this.data
      .sort((a, b) => dayjs(a[FIELD_BY_TIME]).unix() - dayjs(b[FIELD_BY_TIME]).unix())
      .forEach(item => {
        // 计算月份
        let year = `${dayjs.utc(item[FIELD_BY_TIME]).year()}-${dayjs.utc(item[FIELD_BY_TIME]).month() + 1}`;
        // 如果map中没有该月份，则添加
        if (!map.has(year)) {
          map.set(year, []);
        }
        // 将数据添加到对应月份的数组中
        map.get(year).push(item);
      });
    return map;
  }
  // 按周分组数据
  week() {
    let map = new Map();
    // 对数据按照时间字段排序
    this.data
      .sort((a, b) => dayjs(a[FIELD_BY_TIME]).unix() - dayjs(b[FIELD_BY_TIME]).unix())
      .forEach(item => {
        // 计算周数
        let week = `${dayjs.utc(item[FIELD_BY_TIME]).year()}W${dayjs.utc(item[FIELD_BY_TIME]).week()}`;
        // 如果map中没有该周数，则添加
        if (!map.has(week)) {
          map.set(week, []);
        }
        // 将数据添加到对应周数的数组中
        map.get(week).push(item);
      });
    return map;
  }
}
const handlerMergeHeaderCols = ({ cols, defaultColumns, targetCols }) => {
  let dCols = cloneDeep(defaultColumns);
  let backCols = cloneDeep(defaultColumns);
  let innerCols = []
  let startIndex = -1;
  let removeCols = []
  backCols.filter((item, index) => {
    if (!targetCols.length) {
      return false;
    }

    let bol = targetCols.includes(item.field);
    // 如果选中，则从columns中移除
    if (bol) {
      startIndex == -1 && (startIndex = index);
      removeCols.push(item.field)
      innerCols.push(item);
    }
    return bol;
  });

  let arr = cols.map(key => ({ field: key, title: key, width: 120, children: innerCols.map(i => Object.assign({}, i, { field: key + SPLIT_CHAR + i.field })) }));
  removeCols = fieldModel.value.length > 1 ? removeCols.concat(...fieldModel.value) : removeCols

  dCols = dCols.filter(item => !removeCols.includes(item.field))

  let index = fieldModel.value.length > 1 ? (FIELD_FIRST - 1) : FIELD_FIRST
  // TODO 该定位需要优化
  dCols.splice(index, 0, ...arr)
  return { dCols, crossCols: [...arr.map(i => i.children)] }
}
const activeDateType = ref('year');

const tableConfig = ref({
  border: true,
  loading: false,
  showOverflow: true,
  showHeaderOverflow: true,
  showFooterOverflow: true,
  scrollY: {
    enabled: true,
    gt: 0
  },
  scrollX: {
    enabled: true,
    gt: 0
  },
  headerAlign: 'center',
  height: '100%',
  rowConfig: { height: 24 },
  columnConfig: { resizable: true },
  treeConfig: {
    transform: true,
    rowField: '_id',
    parentField: '_parentId'
  },
  rowClassName: ({ row }) => {
    return row.children?.length ? 'has-children' : ''
  }
})

let timer;
const INTERVAL = 300;
const onHnadlerDate = (type) => {
  if (!fieldModel.value.length || !field2.value.length) {
    VxeUI.modal.message({
      content: '请组合数据维度',
      status: 'warning'
    })
    return;
  }

  tableConfig.value.loading = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    activeDateType.value = type;
    handlerDate(activeDateType.value);
  }, INTERVAL)
}

const times = ref(0);
const crossColsList = ref([]);
const handlerDate = (type) => {

  console.log(cloneDeep(cloneData.value))
  data.value = cloneDeep(cloneData.value);
  let oldData = cloneDeep(cloneData.value);

  let lastLevel = 0;

  let cols = [];
  const buildTree = (data, fields, level = 0, path = '', parentId = null) => {
    lastLevel = level;
    if (!fields?.length || !data?.length) {
      return [];
    }

    const field = fields[0];
    const treeMap = new Map();

    data.forEach(item => {
      const key = item[field];
      const arr = treeMap.get(key) || [];
      arr.push(item);
      treeMap.set(key, arr);
    });

    const result = [];
    // 组成树
    treeMap.forEach((items, key) => {
      const currentPath = path ? `${path}/${key}` : key;
      const currentId = uuidv4();

      // 根据日期类型，进行树分组
      let dateHook = new DateHook(items);
      let map = dateHook[type]();
      let dataMap = new Map();
      let keys = Array.from(map.keys());
      cols.push(...keys);
      Array.from(map.entries()).forEach(([key, value]) => {
        value.forEach(item => {
          field2.value.forEach(field => {
            let fieldKey = key + SPLIT_CHAR + field;
            item[fieldKey] = item[field];

            let parentId = item._parentId || item[fieldModel.value[0]];
            let obj = dataMap.get(parentId) || {};
            dataMap.set(parentId, Object.assign(obj, item));
          })
        })
        let arr = Array.from(dataMap.values());
        let obj = arr[0];
        field2.value.forEach(field => {
          let fieldKey = key + SPLIT_CHAR + field;
          obj[fieldKey] = value.reduce((sum, item) => currency(sum).add(item[fieldKey]).value, 0);
          obj.num = currency(obj.num).add(value.length).value;
        })
      })

      // 做完分组后，进行逻辑重算
      let arr = Array.from(dataMap.values());
      let obj = arr[0];

      if (level === fieldModel.value.length - 1) {
        result.push({
          _id: currentId,
          _parentId: parentId,
          _level: level,
          _path: currentPath,
          ...obj
        });
      } else {
        const children = buildTree(items, fields.slice(1), level + 1, currentPath, currentId);
        result.push({
          _id: currentId,
          _parentId: parentId,
          _level: level,
          _path: currentPath,
          ...obj,
          children,
          num: children.length
        });
      }
    });
    return result;
  };

  const start = performance.now();

  const newData = buildTree(oldData, fieldModel.value);

  const flatData = flattenData(newData);
  data.value = flatData;
  cols = uniq(cols).sort();

  const defaultCols = defaultColumns();
  const colsMap = new Map(defaultCols.map(item => [item.field, item]));

  const { dCols, crossCols } = handlerMergeHeaderCols({ cols, defaultColumns: defaultCols, targetCols: field2.value })
  crossColsList.value = flatMap(crossCols);
  columns.value = dCols;
  if (fieldModel.value.length > 1) {
    // TODO 固定位置
    columns.value.splice(FIELD_FIRST - 1, 0, {
      title: fieldModel.value
        .map(i => colsMap.get(i)?.title)
        .join('/'),
      field: '_path',
      width: 220,
      treeNode: true,
      formatter: ({ cellValue }) => {
        return cellValue?.split('/').pop()
      }
    })
  }

  nextTick(() => {
    onClickExpand(true);
    const end = performance.now();
    times.value = end - start;
    VxeUI.modal.message({
      content: `Tree building time: ${end - start}ms`,
      status: 'success'
    })
    tableConfig.value.loading = false;
  })
}

const fieldModel = ref([])
const field2 = ref([])
const xTable = ref();

const handlerSearch = () => {
  if (!fieldModel.value.length || !field2.value.length) {
    VxeUI.modal.message({
      content: '请组合数据维度',
      status: 'warning'
    })
    return;
  }

  tableConfig.value.loading = true;
  timer = setTimeout(async () => {
    data.value = await mockData();
    cloneData.value = cloneDeep(data.value);
    handlerDate(activeDateType.value);

    if (mode.value === 'chart') {
      renderChartHook();
    }
  }, INTERVAL)
}
onMounted(() => {
  tableConfig.value.loading = true;
  timer = setTimeout(async () => {
    cloneData.value = cloneDeep(data.value);
    tableConfig.value.loading = false;
  }, INTERVAL)
})

const expandAll = ref(true);
const onClickExpand = (expand) => {
  expandAll.value = expand || !expandAll.value;
  xTable.value?.setAllTreeExpand(expandAll.value);
}

const mode = ref("table");
const renderChart = () => {
  mode.value = "chart";
  nextTick(() => {
    renderChartHook();
  })
}

const chartIds = ref([]);
const renderChartHook = () => {
  const { fullData } = xTable.value.getTableData()
  let arr1 = fieldModel.value;
  let arr2 = crossColsList.value.map(i => i.field);
  chartIds.value = arr1.concat(arr2);

  nextTick(() => {
    arr1.forEach(id => {
      // 初始化图表实例
      const chart = new Chart({
        container: id,
        autoFit: true
      });
      // chart.coordinate({ type: 'theta', outerRadius: 0.8 });
      // 声明可视化
      chart
        .interval({ maxWidth: 40 }) // 创建一个 Interval 标记
        .data(fullData) // 绑定数据
        .transform({ type: 'stackY' })
        .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
        .encode('x', id) // 编码 x 通道
        .encode('y', field2.value[0]) // 编码 y 通道
        .scrollbar({
          x: {},
        })
        .axis('x', {})

      // 渲染可视化
      chart.render();
    })
    arr2.forEach(id => {
      // 初始化图表实例
      const chart = new Chart({
        container: id,
        autoFit: true
      });

      chart.title(id.split(SPLIT_CHAR).shift());

      // 声明可视化
      chart
        .interval({ maxWidth: 40 }) // 创建一个 Interval 标记
        .data(fullData) // 绑定数据
        .transform({ type: 'stackY' })
        .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
        .encode('x', fieldModel.value[0]) // 编码 x 通道
        .encode('y', id)// 编码 y 通道
        .scrollbar({
          x: {},
        })
        .axis('x', {})

      // 渲染可视化
      chart.render();
    })
  })
}
</script>

<template>
  <div style="width: 100vw;padding: 10px;;">
    <div>
      <vxe-button v-for="btn in buttons" :key="btn.key" @click="onHnadlerDate(btn.key)">
        {{ btn.text }}
        <template #dropdowns>
          <div style="height: 200px;overflow: auto;display: flex;flex-direction: column;">
            <vxe-button v-for="col in defaultCols" mode="text" :content="col.title"
              style="height: 100px;line-height: 100px;"></vxe-button>
          </div>
        </template>
      </vxe-button>
      <vxe-button @click="onClickExpand()">展开/收起</vxe-button>
      <vxe-button v-if="mode === 'table'" @click="renderChart">报表</vxe-button>
      <vxe-button v-else @click="mode = 'table'">列表</vxe-button>
      <vxe-button @click="handlerSearch">查询</vxe-button>
      {{ times }}ms

      <vxe-select :options="defaultCols" v-model="fieldModel" multiple style="width: 200px"
        :option-config="{ useKey: 'field', keyField: 'field' }" :option-props="{ value: 'field', label: 'title' }"
        clearable />
      <vxe-select :options="defaultCols" v-model="field2" multiple style="width: 200px"
        :option-config="{ useKey: 'field', keyField: 'field' }" :option-props="{ value: 'field', label: 'title' }"
        clearable />
    </div>

    <div id="chart-container" v-show="mode === 'chart'">
      <div v-for="id in chartIds" :key="id" class="chart-item">
        <ChartComponent :id="id"></ChartComponent>
        <!-- <vxe-card title=" " style="width: 100%;height: 100%;">
          <template #extra>
            <div class="bg3">
              <vxe-button>柱状图</vxe-button>
              <vxe-button>饼图</vxe-button>
              <vxe-button>折线图</vxe-button>
            </div>
          </template>
          <div :id="id" style="width: 100%;height: 100%;"></div>
        </vxe-card> -->
      </div>
    </div>

    <div v-show="mode === 'table'" style="height: 90vh;width: 90vw">
      <vxe-grid ref="xTable" v-bind="tableConfig" :data="data" :columns="columns" />
    </div>
  </div>
</template>

<style scoped>
:deep(.has-children) {
  background-color: #f0f0f0;
  font-weight: bold;
}

#chart-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

#chart-container .chart-item {
  height: 400px;
  width: calc(50% - 12px);
  padding: 6px;
}
</style>
