<script setup>
import { mockData } from './mock';
import dayjs from 'dayjs';
import { ref } from 'vue';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import currency from "currency.js"
import { cloneDeep } from 'lodash';

dayjs.extend(weekOfYear);

const data = ref(mockData());
const cloneData = ref(cloneDeep(data.value));
const defaultColumns = () => [
  { field: 'id', title: 'ID', width: 80 },
  { field: 'productName', title: '产品名称', width: 120 },
  { field: 'productCode', title: '产品编码', width: 120 },
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


class DateHook {
  constructor() {
    this.data = data.value;
  }
  year() {
    let map = new Map();
    data.value
      .sort((a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix())
      .forEach(item => {
        let year = dayjs(item.createTime).year();
        if (!map.has(year)) {
          map.set(year, []);
        }
        map.get(year).push(item);
      });
    return map;
  }
  quarter() {
    let map = new Map();
    data.value.sort((a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix())
      .forEach(item => {
        let year = `${dayjs(item.createTime).year()}Q${Math.ceil(dayjs(item.createTime).month() / 3)}`;
        if (!map.has(year)) {
          map.set(year, []);
        }
        map.get(year).push(item);
      });
    return map;
  }
  month() {
    let map = new Map();
    data.value
      .sort((a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix())
      .forEach(item => {
        let year = `${dayjs(item.createTime).year()}-${dayjs(item.createTime).month() + 1}`;
        if (!map.has(year)) {
          map.set(year, []);
        }
        map.get(year).push(item);
      });
    return map;
  }
  week() {
    let map = new Map();
    data.value
      .sort((a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix())
      .forEach(item => {
        let week = `${dayjs(item.createTime).year()}W${dayjs(item.createTime).week()}`;
        if (!map.has(week)) {
          map.set(week, []);
        }
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
  backCols.filter((item, index) => {
    if (!targetCols.length) {
      return false;
    }

    let bol = targetCols.includes(item.field);
    // 如果选中，则从columns中移除
    if (bol) {
      startIndex == -1 && (startIndex = index);
      innerCols.push(item);
      dCols.splice(index, 1);
    }
    return bol;
  });

  let arr = cols.map(key => ({ field: key, title: key, width: 120, children: innerCols.map(i => Object.assign({}, i, { field: key + i.field })) }));
  // TODO 该定位需要优化
  dCols.splice(2, 0, ...arr)
  return dCols
}
const activeDateType = ref('year');
const handlerDate = (type) => {
  data.value = cloneDeep(cloneData.value);

  activeDateType.value = type;
  let dataTree = [];
  let splitSybol = "_"
  fieldModel.value.forEach((field, fIndex) => {
    let dataTreeMap = new Map();
    let d = dataTree[fIndex - 1]; // 处理前身数据
    if (!d) {
      data.value.forEach(item => {
        let arr = dataTreeMap.get(item[field]) || []
        arr.push(item);
        item.children = [];
        dataTreeMap.set(item[field], arr);
      })
    } else {
      Array.from(d.entries()).forEach(([key, value]) => {
        let arr = [];
        field2.value.forEach(field2 => {})
        let obj = value[0];
        value.forEach(item => {
          let key2 = key + splitSybol + item[field];
          obj
          arr = dataTreeMap.get(key2) || []
          arr.push(item);
          dataTreeMap.set(key2, arr);
          item.children = arr;
        })
        // d.children = arr;
      })
    }
    dataTree.push(dataTreeMap);
  })

  // 一层数据处理
  let dateHook = new DateHook(data.value);
  const map = dateHook[type]();
  const cols = Array.from(map.keys())
  let dataMap = new Map();
  Array.from(map.entries()).forEach(([key, value]) => {
    value.forEach(item => {
      field2.value.forEach(field => {
        item[key + field] = item[field];
        let obj = dataMap.get(item[fieldModel.value?.[0]]) || {};
        dataMap.set(item[fieldModel.value?.[0]], Object.assign(obj, item));
      })
    })
  })


  if (fieldModel.value.length) {
    data.value = Array.from(dataMap.values())
  }
  columns.value = handlerMergeHeaderCols({ cols, defaultColumns: defaultColumns(), targetCols: field2.value })

}
const fieldModel = ref([])
const field2 = ref([])
const handlerSearch = () => {
  data.value = mockData();
  cloneData.value = cloneDeep(data.value);
  handlerDate(activeDateType.value);
}
</script>

<template>
  <div style="width: 100vw;padding: 10px;">
    <div>
      <vxe-button v-for="btn in buttons" :key="btn.key" @click="handlerDate(btn.key)">
        {{ btn.text }}
      </vxe-button>
      <vxe-button @click="handlerSearch">查询</vxe-button>

      <vxe-select :options="defaultCols" v-model="fieldModel" multiple style="width: 200px"
        :option-config="{ useKey: 'field', keyField: 'field' }" :option-props="{ value: 'field', label: 'title' }"
        clearable />
      <vxe-select :options="defaultCols" v-model="field2" multiple style="width: 200px"
        :option-config="{ useKey: 'field', keyField: 'field' }" :option-props="{ value: 'field', label: 'title' }"
        clearable />
    </div>
    <div style="height: 90vh;">
      <vxe-grid :data="data" :columns="columns" border header-align="center" :scroll-x="{ enabled: true, gt: 60 }"
        :row-config="{ height: 24 }" show-overflow height="100%"
        :tree-config="{ transform: true,  childrenField: 'children' }" />
    </div>
  </div>
</template>

<style scoped></style>
