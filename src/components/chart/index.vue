<script setup>
import { Chart } from '@antv/g2';
import dayjs from 'dayjs';
import { nextTick, ref } from 'vue';
const props = defineProps({ id: String, data: Array })
const chartType = ref('interval');
const cacheData = ref([]);
const cacheX = ref(null)
const cacheY = ref(null)
const cacheOption = ref(null)
const cacheExtra = ref({})

const renderChart = (data, x, y, optoin) => {
  nextTick(() => {
    // TODO后续丰富代码
    // 初始化图表实例
    const chart = new Chart({
      container: props.id,
      autoFit: true
    });

    optoin && chart.options(optoin);

    switch (chartType.value) {
      case 'pie':
        chart.coordinate({ type: 'theta', outerRadius: 0.8 });

        // 声明可视化
        chart
          .interval({ maxWidth: 40 }) // 创建一个 Interval 标记
          .data(data) // 绑定数据
          .transform({ type: 'stackY' })
          .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
          .encode('color', x)
          .encode('y', y) // 编码 y 通道
          .label({
            position: 'spider',
            text: (data) => `${data[x]}: ${data[y]}`,
          })
        break;
      case 'line-date':
        chart
          .data(cacheExtra.value.flatData)
          .encode('x', 'createTime')
          .encode('y', y.split('_').pop())
          .encode('color', x)
          .scale('y', {
            nice: true,
          })
          .axis('x', { labelFormatter: (d) => dayjs(d).format('YYYY-MM-DD') });

        chart
          .line()
          .encode('shape', 'smooth');

        chart.point().encode('shape', 'point').tooltip(false)
          .scrollbar({
            x: {},
          }).axis('x', {});

        chart.render();
        break;
      case 'line':
        // 声明可视化
        chart // 创建一个 Interval 标记
          .data(data) // 绑定数据
          .transform({ type: 'stackY' })
          .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
          .encode('x', x) // 编码 x 通道
          .encode('y', y) // 编码 y 通道

        chart.line()
          .label({
            text: y,
            style: {
              dx: -10,
              dy: -12,
            },
          })

        chart
          .point()
          .style('fill', 'white')
          .tooltip(false)

        break;

      default:
        // 声明可视化
        chart[chartType.value]({ maxWidth: 40 }) // 创建一个 Interval 标记
          .data(data) // 绑定数据
          .transform({ type: 'stackY' })
          .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
          .encode('x', x) // 编码 x 通道
          .encode('y', y) // 编码 y 通道
          // .transform({ type: 'sortX', by: 'y', reverse: true, slice: 6 })
          .encode('color', x)
          // .style('maxWidth', 20)
          .scrollbar({
            x: {},
          })
          .axis('x', {})
        break;
    }

    // 渲染可视化
    chart.render();
  })
}
const renderChartBindData = (data, x, y, optoin, extra) => {
  cacheData.value = data
  cacheX.value = x
  cacheY.value = y
  cacheOption.value = optoin
  cacheExtra.value = extra

  renderChart(cacheData.value, cacheX.value, cacheY.value, cacheOption.value)
}
const changeChartType = (type) => {
  if (type === chartType.value) return

  chartType.value = type
  renderChart(cacheData.value, cacheX.value, cacheY.value, cacheOption.value)
}
defineExpose({
  renderChart: renderChartBindData
})
</script>

<template>
  <vxe-card title=" " style="width: 100%;height: 100%;">
    <template #extra>
      <div class="bg3">
        <vxe-button @click="changeChartType('interval')"
          :status="chartType === 'interval' ? 'primary' : 'default'">柱状图</vxe-button>
        <vxe-button @click="changeChartType('pie')"
          :status="chartType === 'pie' ? 'primary' : 'default'">饼图</vxe-button>
        <vxe-button @click="changeChartType('line')"
          :status="chartType === 'line' ? 'primary' : 'default'">折线图</vxe-button>
        <vxe-button @click="changeChartType('line-date')"
          :status="chartType === 'line-date' ? 'primary' : 'default'">日渐图</vxe-button>
      </div>
    </template>
    <div :id="id" style="width: 100%;height: 100%;"></div>
  </vxe-card>
</template>