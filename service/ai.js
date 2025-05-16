const { AI_API_URL, AI_API_KEY } = require('./setting');
const prompt = `以下是为您定制的专业提示语模板，可直接复制到新对话中高效获取所需结果：

【智能表格生成指令】
请根据提供的MySQL表结构，生成符合以下要求的vxe-table columns配置：
1. 核心原则：用关联实体名称替换所有ID字段（如customer_id→客户姓名+公司）
2. 字段处理：
   - 保留全部非ID字段
   - 金额字段自动添加(元)单位
   - 比率类字段补充(%)标注
   - 时间字段统一格式化为"YYYY-MM-DD HH:mm"
3. 业务映射：
   - 布尔值转为"是/否"
   - 使用中文业务术语（如is_vip→VIP标识）
   - 自动关联外键字段的附属信息
4. 输出格式：纯JavaScript数组，仅含field、title属性

示例输入：
/* 表结构包含外键关联 */
CREATE TABLE orders (
  user_id INT,
  product_id INT,
  amount DECIMAL(10,2),
  is_paid BOOL
);

示例输出：
[
  { field: 'user_name', title: '用户名称' },
  { field: 'product_name', title: '商品名称' },
  { field: 'amount', title: '订单金额(元)' },
  { field: 'is_paid', title: '支付状态' }
]

请确认理解需求，我将提供具体表结构。

此提示语特点：
1. 明确排除ID字段的转换逻辑
2. 强调中国本土化需求（中文标题、单位）
3. 内置示例确保格式一致性
4. 强制输出纯净数据结构
5. 自动处理关联字段的语义转换
`
module.exports = function middleware(app, db) {
  app.post('/api/ai/genColumn', async (req, res) => {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        ["Content-Type"]: "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek-chat",
        "messages": [
          {
            "role": "system",
            "content": prompt
          },
          {
            "role": "user",
            "content": req.sql
          }
        ],
        "stream": false
      })
    }).then(body => body.json())
  });
}