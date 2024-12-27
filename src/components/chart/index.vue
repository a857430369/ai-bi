<script setup>
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { nextTick, ref } from 'vue';
const props = defineProps({ id: String, data: Array })
const chartType = ref('interval');
const cacheData = ref([]);
const cacheX = ref(null)
const cacheY = ref(null)
const cacheOption = ref(null)
const cacheExtra = ref({})

const renderChartV1 = (data, x, y, optoin) => {
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
          .transform({ type: 'normalizeY', basis: 'first', groupBy: 'color' })
          .encode('x', 'createTime')
          .encode('y', y.split('_').pop())
          .encode('color', x)
          .scale('y', { type: 'log' })
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
      case 'complex':
        const scaleColor = (node) =>
          node.scale('color', {
            palette: 'cool',
            offset: (t) => t * 0.8 + 0.1,
          });

        const layer = chart.spaceLayer().data(data);
        // 柱图
        layer
          .interval()
          .attr('paddingLeft', 50)
          .transform({ type: 'sortX', reverse: true, by: 'y' })
          .encode('x', x)
          .encode('y', y)
          .encode('color', x)
          .call(scaleColor);

        // 饼图
        layer
          .interval()
          .attr('x', 300)
          .attr('y', 50)
          .attr('paddingLeft', 400)
          .attr('paddingBottom', 200)
          .coordinate({ type: 'theta' })
          .transform({ type: 'stackY' })
          .legend(false)
          .encode('y', y)
          .encode('color', x)
          .call(scaleColor);

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
const renderChart = (data, x, y, optoin) => {
  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(document.getElementById(props.id));
  let yData = [];
  const xData = Array.from(new Set(data.map(item => {
    yData.push(item[y])
    return item[x]
  })))

  // 绘制图表
  myChart.setOption({
    title: {
      text: `${props.id}`
    },
    tooltip: {},
    xAxis: {
      data: xData
    },
    yAxis: {},
    series: [
      {
        name: y,
        type: 'bar',
        data: yData
      }
    ]
  });
  nextTick(() => {
    myChart.resize()
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
        <vxe-button @click="changeChartType('complex')"
          :status="chartType === 'complex' ? 'primary' : 'default'">复合图</vxe-button>
      </div>
    </template>
    <div :id="id" style="width: 100%;height: 100%;"></div>
  </vxe-card>
</template>