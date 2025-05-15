const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

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
const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库连接配置
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'demo'
});

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

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('数据库连接成功');
});
// 获取数据结构
async function getDbStructure() {
  try {
    const tables = ['products', 'customers', 'sales_records'];
    const sqls = tables.map(table => `DESCRIBE ${table}`);
    const results = {};

    for (let i = 0; i < sqls.length; i++) {
      const data = await new Promise((resolve, reject) => {
        db.query(sqls[i], (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });
      results[tables[i]] = data;
    }

    return results
  } catch (err) {
    throw err;
  }
}
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

// API路由
// 获取所有产品
app.get('/api/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 添加新产品
app.post('/api/products', (req, res) => {
  const { name, product_code, unit_price, cost_price, combination } = req.body;
  const sql = 'INSERT INTO products (name, product_code, unit_price, cost_price, combination) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, product_code, unit_price, cost_price, combination], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId, message: '产品添加成功' });
  });
});

// 更新产品信息
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, product_code, unit_price, cost_price, combination } = req.body;
  const sql = 'UPDATE products SET name=?, product_code=?, unit_price=?, cost_price=?, combination=? WHERE id=?';
  db.query(sql, [name, product_code, unit_price, cost_price, combination, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '产品信息更新成功' });
  });
});

// 删除产品
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM products WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '产品删除成功' });
  });
});

// 获取所有客户
app.get('/api/customers', (req, res) => {
  const sql = 'SELECT * FROM customers';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 添加新客户
app.post('/api/customers', (req, res) => {
  const {
    name, company, email, phone, customer_type, customer_level,
    customer_age, customer_occupation, purchase_count, total_spent,
    avg_order_amount, last_purchase_date, registration_date,
    preferred_payment_method, is_vip
  } = req.body;

  const sql = `INSERT INTO customers (
    name, company, email, phone, customer_type, customer_level,
    customer_age, customer_occupation, purchase_count, total_spent,
    avg_order_amount, last_purchase_date, registration_date,
    preferred_payment_method, is_vip
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    name, company, email, phone, customer_type, customer_level,
    customer_age, customer_occupation, purchase_count, total_spent,
    avg_order_amount, last_purchase_date, registration_date,
    preferred_payment_method, is_vip
  ], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId, message: '客户添加成功' });
  });
});

// 更新客户信息
app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const {
    name, company, email, phone, customer_type, customer_level,
    customer_age, customer_occupation, purchase_count, total_spent,
    avg_order_amount, last_purchase_date, registration_date,
    preferred_payment_method, is_vip
  } = req.body;

  const sql = `UPDATE customers SET 
    name=?, company=?, email=?, phone=?, customer_type=?, customer_level=?,
    customer_age=?, customer_occupation=?, purchase_count=?, total_spent=?,
    avg_order_amount=?, last_purchase_date=?, registration_date=?,
    preferred_payment_method=?, is_vip=?
    WHERE id=?`;

  db.query(sql, [
    name, company, email, phone, customer_type, customer_level,
    customer_age, customer_occupation, purchase_count, total_spent,
    avg_order_amount, last_purchase_date, registration_date,
    preferred_payment_method, is_vip, id
  ], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '客户信息更新成功' });
  });
});

// 删除客户
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM customers WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '客户删除成功' });
  });
});

// 获取所有销售记录，包括关联的客户信息、ID和产品信息
app.get('/api/sales', (req, res) => {
  let sql = `SELECT
  s.id as id,
	p.id AS product_id,
	p.product_name,
	p.product_code,
	p.unit_price,
	p.cost_price,
	p.combination,
	s.amount,
	s.payment_amount,
	s.received_amount,
	s.actual_price,
	s.profit,
	s.total_profit,
	s.quantity,
	s.discount,
	s.quotation_delay,
	s.order_delay,
	s.payment_delay,
	s.delivery_delay,
	s.total_process_days,
	s.relation_type,
	s.region,
	s.channel,
	s.payment_method,
	s.STATUS,
	s.is_coupon_used,
	s.is_first_purchase,
	s.return_rate,
	s.customer_satisfaction,
	s.profit_margin,
	s.has_returned,
	s.has_complaints,
	s.recommendation_score,
  s.create_time,
	c.id AS customer_id,
	c.NAME AS customer_name,
	c.company AS customer_company,
	c.email AS customer_email,
	c.phone AS customer_phone,
	c.customer_type,
	c.customer_level,
	c.customer_age,
	c.customer_occupation,
	c.purchase_count,
	c.total_spent,
	c.avg_order_amount,
	c.last_purchase_date,
	c.registration_date,
	c.preferred_payment_method,
	c.is_vip 
FROM
	products p
	JOIN sales_records s ON p.id = s.product_id
	JOIN customers c ON c.id = s.customer_id`;
  if (req.body.sql) {
    sql = req.body.sql;
  }

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 添加新销售记录
app.post('/api/sales', (req, res) => {
  const {
    product_id, customer_id, amount, payment_amount, received_amount,
    actual_price, profit, total_profit, quantity, discount,
    inquiry_time, quotation_time, create_time, order_time,
    payment_time, delivery_time, receive_time, review_time,
    quotation_delay, order_delay, payment_delay, delivery_delay,
    total_process_days, year, quarter, month, week, day_of_week,
    relation_type, region, channel, payment_method, status,
    is_coupon_used, is_first_purchase, return_rate,
    customer_satisfaction, profit_margin, has_returned,
    has_complaints, recommendation_score
  } = req.body;

  const sql = `INSERT INTO sales_records (
    product_id, customer_id, amount, payment_amount, received_amount,
    actual_price, profit, total_profit, quantity, discount,
    inquiry_time, quotation_time, create_time, order_time,
    payment_time, delivery_time, receive_time, review_time,
    quotation_delay, order_delay, payment_delay, delivery_delay,
    total_process_days, year, quarter, month, week, day_of_week,
    relation_type, region, channel, payment_method, status,
    is_coupon_used, is_first_purchase, return_rate,
    customer_satisfaction, profit_margin, has_returned,
    has_complaints, recommendation_score
  ) VALUES (${Array(39).fill('?').join(',')})`;

  db.query(sql, [
    product_id, customer_id, amount, payment_amount, received_amount,
    actual_price, profit, total_profit, quantity, discount,
    inquiry_time, quotation_time, create_time, order_time,
    payment_time, delivery_time, receive_time, review_time,
    quotation_delay, order_delay, payment_delay, delivery_delay,
    total_process_days, year, quarter, month, week, day_of_week,
    relation_type, region, channel, payment_method, status,
    is_coupon_used, is_first_purchase, return_rate,
    customer_satisfaction, profit_margin, has_returned,
    has_complaints, recommendation_score
  ], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId, message: '销售记录添加成功' });
  });
});

// 更新销售记录
app.put('/api/sales/:id', (req, res) => {
  const { id } = req.params;
  const {
    product_id, customer_id, amount, payment_amount, received_amount,
    actual_price, profit, total_profit, quantity, discount,
    inquiry_time, quotation_time, create_time, order_time,
    payment_time, delivery_time, receive_time, review_time,
    quotation_delay, order_delay, payment_delay, delivery_delay,
    total_process_days, year, quarter, month, week, day_of_week,
    relation_type, region, channel, payment_method, status,
    is_coupon_used, is_first_purchase, return_rate,
    customer_satisfaction, profit_margin, has_returned,
    has_complaints, recommendation_score
  } = req.body;

  const sql = `UPDATE sales_records SET 
    product_id=?, customer_id=?, amount=?, payment_amount=?, received_amount=?,
    actual_price=?, profit=?, total_profit=?, quantity=?, discount=?,
    inquiry_time=?, quotation_time=?, create_time=?, order_time=?,
    payment_time=?, delivery_time=?, receive_time=?, review_time=?,
    quotation_delay=?, order_delay=?, payment_delay=?, delivery_delay=?,
    total_process_days=?, year=?, quarter=?, month=?, week=?, day_of_week=?,
    relation_type=?, region=?, channel=?, payment_method=?, status=?,
    is_coupon_used=?, is_first_purchase=?, return_rate=?,
    customer_satisfaction=?, profit_margin=?, has_returned=?,
    has_complaints=?, recommendation_score=?
    WHERE id=?`;

  db.query(sql, [
    product_id, customer_id, amount, payment_amount, received_amount,
    actual_price, profit, total_profit, quantity, discount,
    inquiry_time, quotation_time, create_time, order_time,
    payment_time, delivery_time, receive_time, review_time,
    quotation_delay, order_delay, payment_delay, delivery_delay,
    total_process_days, year, quarter, month, week, day_of_week,
    relation_type, region, channel, payment_method, status,
    is_coupon_used, is_first_purchase, return_rate,
    customer_satisfaction, profit_margin, has_returned,
    has_complaints, recommendation_score, id
  ], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '销售记录更新成功' });
  });
});

// 删除销售记录
app.delete('/api/sales/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM sales_records WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '销售记录删除成功' });
  });
});
// 生成随机销售数据的API
app.get('/api/generate-sales', async (req, res) => {
  try {
    const COUNT = 1000;
    const products = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM products', (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    const customers = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM customers', (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    const mockData = [];
    for (let i = 0; i < COUNT; i++) {
      // 更真实的数量分布 - 大多数订单数量较小
      const quantity = Math.floor(Math.exp(Math.random() * 2)) + 1;

      // 更真实的价格分布 - 基于正态分布
      const basePrice = 100 + (Math.random() + Math.random() + Math.random()) * 300;
      const unitPrice = +basePrice.toFixed(2);

      // 更真实的折扣分布 - 集中在特定档位
      const discountLevels = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
      const discount = discountLevels[Math.floor(Math.random() * discountLevels.length)];

      const actualPrice = +(unitPrice * (1 - discount)).toFixed(2);
      const totalAmount = +(quantity * actualPrice).toFixed(2);

      // 更真实的成本价格 - 基于行业平均毛利率
      const costPrice = +(unitPrice * 0.6).toFixed(2);
      const profit = +(actualPrice - costPrice).toFixed(2);
      const totalProfit = +(profit * quantity).toFixed(2);

      // 更真实的收付款情况 - 大部分能全额收到
      const paymentAmount = Math.random() > 0.1 ? totalAmount : +(totalAmount * 0.9).toFixed(2);
      const receivedAmount = Math.random() > 0.05 ? paymentAmount : +(paymentAmount * 0.95).toFixed(2);

      // 更真实的时间分布
      const now = new Date();
      const threeYearsAgo = new Date(now.getFullYear() - 3, 0, 1);
      const createDate = new Date(threeYearsAgo.getTime() + Math.random() * (now.getTime() - threeYearsAgo.getTime()));

      // 更真实的业务流程时间间隔
      const inquiryTime = new Date(createDate.getTime() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000);
      const quotationTime = new Date(inquiryTime.getTime() + Math.floor(Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
      const orderDate = new Date(createDate.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
      const paymentTime = new Date(orderDate.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000);
      const deliveryDate = new Date(paymentTime.getTime() + Math.floor(Math.random() * 5 + 2) * 24 * 60 * 60 * 1000);
      const receiveTime = new Date(deliveryDate.getTime() + Math.floor(Math.random() * 3 + 1) * 24 * 60 * 60 * 1000);
      const reviewTime = new Date(receiveTime.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);

      const sql = `INSERT INTO sales_records SET ?`;
      const data = {
        product_id: products[Math.floor(Math.random() * products.length)].id,
        customer_id: customers[Math.floor(Math.random() * customers.length)].id,
        amount: totalAmount,
        payment_amount: paymentAmount,
        received_amount: receivedAmount,
        actual_price: actualPrice,
        profit: profit,
        total_profit: totalProfit,
        quantity: quantity,
        discount: discount,
        inquiry_time: inquiryTime,
        quotation_time: quotationTime,
        create_time: createDate,
        order_time: orderDate,
        payment_time: paymentTime,
        delivery_time: deliveryDate,
        receive_time: receiveTime,
        review_time: reviewTime,
        quotation_delay: Math.floor((quotationTime - inquiryTime) / (24 * 60 * 60 * 1000)),
        order_delay: Math.floor((orderDate - createDate) / (24 * 60 * 60 * 1000)),
        payment_delay: Math.floor((paymentTime - orderDate) / (24 * 60 * 60 * 1000)),
        delivery_delay: Math.floor((deliveryDate - paymentTime) / (24 * 60 * 60 * 1000)),
        total_process_days: Math.floor((reviewTime - inquiryTime) / (24 * 60 * 60 * 1000)),
        year: createDate.getFullYear(),
        quarter: Math.floor(createDate.getMonth() / 3) + 1,
        month: createDate.getMonth() + 1,
        week: Math.ceil(createDate.getDate() / 7),
        day_of_week: createDate.getDay(),
        relation_type: ['直接销售', '直接销售', '直接销售', '代理销售', '电商平台'][Math.floor(Math.random() * 5)],
        region: ['华东', '华东', '华南', '华北', '华中', '西南', '西北', '东北'][Math.floor(Math.random() * 8)],
        channel: ['线下门店', '线下门店', '官方商城', '天猫', '京东'][Math.floor(Math.random() * 5)],
        payment_method: ['支付宝', '支付宝', '微信支付', '微信支付', '银行卡'][Math.floor(Math.random() * 5)],
        status: ['已签收', '已签收', '已签收', '已发货', '已付款', '待付款'][Math.floor(Math.random() * 6)],
        is_coupon_used: Math.random() > 0.7,
        is_first_purchase: Math.random() > 0.9,
        return_rate: +(Math.random() * 0.05).toFixed(3),
        customer_satisfaction: [5, 5, 5, 4, 4, 3][Math.floor(Math.random() * 6)],
        profit_margin: +(profit / actualPrice).toFixed(2),
        has_returned: Math.random() > 0.95,
        has_complaints: Math.random() > 0.97,
        recommendation_score: [10, 9, 9, 8, 8, 7][Math.floor(Math.random() * 6)]
      };

      mockData.push(new Promise((resolve, reject) => {
        db.query(sql, data, (err) => {
          if (err) reject(err);
          resolve();
        });
      }));
    }

    await Promise.all(mockData);
    res.json({ message: `成功生成${COUNT}条销售记录` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 生成客户数据
app.get('/api/generate-customers', async (req, res) => {
  try {
    const COUNT = 100;
    const mockData = [];
    const sql = 'INSERT INTO customers SET ?';

    const companyPrefixes = ['上海', '北京', '广州', '深圳', '杭州', '南京', '成都'];
    const companySuffixes = ['科技', '贸易', '电子', '商贸', '实业', '工业'];
    const domains = ['qq.com', '163.com', 'gmail.com', '126.com', 'hotmail.com'];
    const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
    const secondNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超'];

    for (let i = 0; i < COUNT; i++) {
      const registrationDate = new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000); // 最近两年内
      const lastPurchaseDate = new Date(registrationDate.getTime() + Math.random() * (Date.now() - registrationDate.getTime()));

      const companyName = `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]}${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}有限公司`;
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const secondName = secondNames[Math.floor(Math.random() * secondNames.length)];
      const fullName = firstName + secondName;

      const data = {
        name: fullName,
        company: companyName,
        email: `${fullName}${Math.floor(Math.random() * 1000)}@${domain}`,
        phone: `1${Math.floor(Math.random() * 2) + 3}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        customer_type: ['个人', '个人', '企业', '企业', '政府'][Math.floor(Math.random() * 5)],
        customer_level: ['普通会员', '普通会员', '银卡会员', '金卡会员', '钻石会员'][Math.floor(Math.random() * 5)],
        customer_age: ['26-35', '26-35', '36-45', '36-45', '18-25', '46-55', '56+'][Math.floor(Math.random() * 7)],
        customer_occupation: ['上班族', '上班族', '企业主', '自由职业', '学生'][Math.floor(Math.random() * 5)],
        purchase_count: Math.floor(Math.exp(Math.random() * 3)),
        total_spent: +(Math.exp(Math.random() * 10)).toFixed(2),
        avg_order_amount: +(Math.random() * 2000 + 500).toFixed(2),
        last_purchase_date: lastPurchaseDate,
        registration_date: registrationDate,
        preferred_payment_method: ['支付宝', '支付宝', '微信支付', '微信支付', '银行卡'][Math.floor(Math.random() * 5)],
        is_vip: Math.random() > 0.8
      };

      mockData.push(new Promise((resolve, reject) => {
        db.query(sql, data, (err) => {
          if (err) reject(err);
          resolve();
        });
      }));
    }

    await Promise.all(mockData);
    res.json({ message: `成功生成${COUNT}条客户数据` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 生成产品数据
app.get('/api/generate-products', async (req, res) => {
  try {
    const COUNT = 50;
    const mockData = [];
    const sql = 'INSERT INTO products SET ?';

    const productTypes = ['办公椅', '会议桌', '文件柜', '沙发', '工位', '书柜', '茶几', '前台', '屏风'];
    const brandPrefixes = ['优质', '高端', '豪华', '经典', '现代', '简约', '北欧', '轻奢', '实木'];
    const brandSuffixes = ['家具', '办公', '家私', '工艺', '制造', '创意'];
    const productFeatures = ['人体工学', '可调节', '多功能', '智能', '环保', '时尚', '组合式', '模块化'];
    const materials = ['实木', '钢制', '玻璃', '布艺', '皮革', '金属', '复合材料'];

    for (let i = 0; i < COUNT; i++) {
      // 随机生成产品名称组合
      const type = productTypes[Math.floor(Math.random() * productTypes.length)];
      const brand = `${brandPrefixes[Math.floor(Math.random() * brandPrefixes.length)]}${brandSuffixes[Math.floor(Math.random() * brandSuffixes.length)]}`;
      const feature = productFeatures[Math.floor(Math.random() * productFeatures.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];

      // 基础成本在500-5000之间随机
      const baseCost = +(500 + Math.random() * 4500).toFixed(2);
      // 成本价在基础成本的0.8-1.2倍之间浮动
      const costPrice = +(baseCost * (0.8 + Math.random() * 0.4)).toFixed(2);
      // 加价率在1.2-2.0之间随机
      const markup = 1.2 + Math.random() * 0.8;

      const data = {
        product_name: `${brand}${material}${feature}${type}`,
        product_code: `P${String(i + 1).padStart(4, '0')}`,
        unit_price: +(costPrice * markup).toFixed(2),
        cost_price: costPrice,
        combination: Math.random() > 0.7 ? (Math.random() > 0.5 ? '组合' : '套装') : '单品'
      };

      mockData.push(new Promise((resolve, reject) => {
        db.query(sql, data, (err) => {
          if (err) reject(err);
          resolve();
        });
      }));
    }

    await Promise.all(mockData);
    res.json({ message: `成功生成${COUNT}条产品数据` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});