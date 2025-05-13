module.exports = function getAiDesc(sql, defaultCols, message) {
  return `
  作为SQL专家，请根据以下需求生成规范化的SQL语句和字段映射：

【数据库结构输入】
${JSON.stringify(sql)}

【任务要求】
1. SQL规范：
   - 表名必须使用下划线命名法（snake_case）
   - 保持字段平铺，不做聚合计算
   - 确保关联关系正确性
   - 结果字段需完整包含所有需要的列

2. 字段选择规则：
   * 必须严格从列配置中选择（当前列配置：${JSON.stringify(defaultCols)}）
   * 字段命名转换规则：
     - 表字段：保持原始命名
     - 输出字段：转为驼峰命名（首字母小写）

3. 数据处理要求：
   - fieldModel: 用于前端树形结构的分组字段（如 ["customerName","productName"]）
   - field2: 用于统计分析的数值字段（如 ["salesVolume"]）
   - filterField: 过滤条件数组，值支持数组格式（示例：[{"field":"status","value":[1,2]}])

4. 输出格式要求：
{
  "sql": ["规范化的SQL语句(可执行)"],
  "table": {
    "fieldModel": ["分组字段"],
    "field2": ["统计字段"],
    "filterField": [{"field":"过滤字段","value":"值"}]
  }
}

【用户需求描述】
${message}

请直接返回规范的JSON，无需解释说明。确保：
1. 所有字段从列配置中选取
2. 表名使用下划线格式
3. 输出字段为驼峰格式
4. 过滤值支持数组格式
5. SQL保持最简关联关系
  `
}