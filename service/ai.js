const { AI_API_URL, AI_API_KEY } = require('./setting');
const prompt = `以下是优化后的提示词，严格限定输出为纯JSON格式，并进一步精简指令：

---
请根据MySQL表结构生成vxe-table columns配置JSON数组，要求：
1. 字段处理：
   - 替换所有_id后缀字段为关联实体名称（如user_id→user_name）
   - 保留非ID字段原值
   - 金额/比率字段自动添加(元)/(%)单位
2. 输出规范：
   - 仅包含{"field":"","title":""}结构
   - 布尔值转"是/否"
   - 时间格式化为"YYYY-MM-DD HH:mm"
   - 强制使用中文业务术语
   - 如果判断为布尔字段，则添加, type: boolean
   - 如果是时间类型，则添加, type: date

示例输入：
{
  name: "customers",
  columns: [
    {
      TABLE_CATALOG: "def",
      TABLE_SCHEMA: "demo",
      TABLE_NAME: "customers",
      COLUMN_NAME: "id",
      ORDINAL_POSITION: 1,
      COLUMN_DEFAULT: null,
      IS_NULLABLE: "NO",
      DATA_TYPE: "int",
      CHARACTER_MAXIMUM_LENGTH: null,
      CHARACTER_OCTET_LENGTH: null,
      NUMERIC_PRECISION: 10,
      NUMERIC_SCALE: 0,
      DATETIME_PRECISION: null,
      CHARACTER_SET_NAME: null,
      COLLATION_NAME: null,
      COLUMN_TYPE: "int(11)",
      COLUMN_KEY: "PRI",
      EXTRA: "auto_increment",
      PRIVILEGES: "select,insert,update,references",
      COLUMN_COMMENT: "主键",
      GENERATION_EXPRESSION: "",
      _X_ROW_KEY: "row_176",
    }
  ]
}

示例输出：(把所有表的全部字段都列出来，找出他们的关联关系，输出一个columns)
[
  {"field": "user_name", "title": "用户名称"},
  {"field": "product_name", "title": "商品名称"}, 
  {"field": "amount", "title": "订单金额(元)"},
  {"field": "is_paid", "title": "支付状态"}
]

请直接返回JSON，无需解释说明。
---

优化点：
1. 删除所有非必要描述，聚焦JSON输出
2. 使用更简洁的Markdown代码块包裹示例
3. 移除模板自述内容
4. 强化"直接返回JSON"指令
5. 字段处理规则改用条目式列举
`
const cacheMap = new Map();
async function getColumnCache(sql) {
  if (cacheMap.has(sql)) {
    return cacheMap.get(sql)
  }
  let response = await fetch(AI_API_URL, {
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
          "content": JSON.stringify(sql).replace(/\s+/g, ' ').trim()
        }
      ],
      "stream": false
    })
  }).then(body => {
    if (body.status === 200) {
      return body.json()
    } else {
      ;
      return null
    }
  })
  return response
}
module.exports = function middleware(app) {
  app.post('/api/ai/genColumn', async (req, res) => {
    const response = await getColumnCache(req.body.sql);
    cacheMap.set(req.body.sql, response);
    const { content } = response.choices[0].message
    const jsonContent = content.replace(/```json|```/g, '').trim().replace(/\n/g, '');
    const columns = JSON.parse(jsonContent)
    res.json({
      columns
    });
    console.log("response", response);
  });
}