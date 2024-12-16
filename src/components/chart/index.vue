<script setup>
import { Chart } from '@antv/g2';
import { onMounted } from 'vue';
defineProps({ id: String, data: Array })
const renderChart = (data) => {
  // 初始化图表实例
  const chart = new Chart({
    container: props.id,
    autoFit: true
  });
  // chart.coordinate({ type: 'theta', outerRadius: 0.8 });
  // 声明可视化
  chart
    .interval({ maxWidth: 40 }) // 创建一个 Interval 标记
    .data(data) // 绑定数据
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
}
onMounted(() => {
  renderChart([]);
})
defineExpose({
  renderChart
})
</script>

<template>
  <vxe-card title=" " style="width: 100%;height: 100%;">
    <template #extra>
      <div class="bg3">
        <vxe-button>柱状图</vxe-button>
        <vxe-button>饼图</vxe-button>
        <vxe-button>折线图</vxe-button>
      </div>
    </template>
    <div :id="id" style="width: 100%;height: 100%;"></div>
  </vxe-card>
</template>