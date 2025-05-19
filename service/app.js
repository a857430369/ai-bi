const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const product = require('./product');
const ai = require('./ai');
const db = require('./db');
// TODO 如何做好会话记录

// 获取SQL语句
function getAiDesc(sql, defaultCols, message) {
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
   - 结果字段必须严格从列配置中选择
   - 输出字段：转为驼峰命名（首字母小写）
   - 保持列配置中不删减

2. 字段选择规则：
   * 必须严格从列配置中选择（当前列配置：${JSON.stringify(defaultCols)}）
   * 字段命名转换规则：
     - 表字段：保持原始命名
     - 输出字段：转为驼峰命名（首字母小写）

3. 数据处理要求：
   - fieldModel: 用于前端树形结构的分组字段,请着重判断数据的关系（示例：地区-客户-产品 ["customerName","productName"]）
   - field2: 用于统计分析的数值字段（示例： ["salesVolume"]）
   - filterField: 过滤条件数组，值支持数组格式（示例：[{"field":"status","value":[1,2]}])
   - sql 根据客户描述，可适当添加过滤语句

4. 输出格式要求：
{
  "sql": ["规范化的SQL语句(可执行)"],
  "table": {
    "fieldModel": ["分组字段"],
    "field2": ["统计字段"],
    "filterField": [{"field":"过滤字段","value":["过滤值（字符串）"]}]
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
7. 返回的SQL语句需要执行
8. 返回的内容需JSON可格式化解析
  `
}
exports.getAiDesc = getAiDesc;
const app = express();
exports.app = app;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库连接配置
let dbConnect={db:null};
db(app, dbConnect);
product(app, dbConnect)
ai(app)

// 将下划线命名转换为驼峰命名
function underscoreToCamel(str) {
  return str.replace(/_([a-z])/g, (match, group) => group.toUpperCase());
}

// 使用中间件将数据转换为驼峰命名
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const originalSend = res.send;
    res.send = (data) => {
      let json = JSON.parse(data);
      if (Array.isArray(json)) {
        json = json.map(item => {
          if (typeof item === 'object') {
            return Object.keys(item).reduce((acc, key) => {

              acc[underscoreToCamel(key)] = item[key];
              return acc;
            }, {});
          }
          return item;
        });
      } else if (typeof json === 'object') {
        json = Object.keys(json).reduce((acc, key) => {
          acc[underscoreToCamel(key)] = json[key];
          return acc;
        }, {});
      }
      originalSend.call(res, JSON.stringify(json));
    };
  }
  next();
});
// 获取数据结构

// 输出SQL结构的API
app.get('/api/sql-structure', async (req, res) => {
  try {
    res.json(await getDbStructure());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 根据AI需求生成SQL语句
app.post('/api/ai-query', async (req, res) => {
  try {
    const sql = await getDbStructure()
    const sqlFile = await fs.readFileSync(path.join(__dirname, './demo.sql'), 'utf-8')
    const desc = getAiDesc(sqlFile, req.body.defaultCols, req.body.message)

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-142bf051a904464c9709d81215d26b74",
        ["Content-Type"]: "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek-chat",
        // "prompt": desc,
        "messages": [
          {
            "role": "system",
            "content": "作为MYSQL专家，请根据以下需求生成规范化的SQL语句和字段映射关系，并返回JSON格式结果。"
          },
          {
            "role": "user",
            "content": desc
          }
        ],
        "stream": false
      })
    }).then(body => body.json())

    // 根据AI返回的SQL语句执行查询
    const { content } = response.choices[0].message
    const jsonContent = content.replace(/```json|```/g, '').trim().replace(/\n/g, '');
    const {
      sql: sqlResult,
      table
    } = JSON.parse(jsonContent)
    const sqlQuery = sqlResult.join("");
    console.log(sqlQuery)
    db.query(sqlQuery, (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        list: results,
        table
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});