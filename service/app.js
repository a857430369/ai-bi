const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

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

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('数据库连接成功');
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

// 获取所有销售记录
app.get('/api/sales', (req, res) => {
  const sql = 'SELECT * FROM sales_records';
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

    const products = [
      // 办公椅系列
      { name: 'Herman Miller Aeron人体工学椅', type: '办公椅', baseCost: 3000 },
      { name: 'Steelcase Gesture可调节办公椅', type: '办公椅', baseCost: 2500 },
      { name: 'HAG Capisco马鞍工学椅', type: '办公椅', baseCost: 2000 },
      { name: '西昊M18人体工学电脑椅', type: '办公椅', baseCost: 500 },
      { name: '网易严选人体工学转椅', type: '办公椅', baseCost: 800 },
      
      // 会议桌系列  
      { name: '圣奥北欧实木会议桌', type: '会议桌', baseCost: 4000 },
      { name: '优渡现代简约会议桌', type: '会议桌', baseCost: 2500 },
      { name: '欧丽家具钢架会议桌', type: '会议桌', baseCost: 1800 },
      { name: '联邦家私洽谈桌', type: '会议桌', baseCost: 1200 },
      { name: '全实木会议桌大型会议室桌', type: '会议桌', baseCost: 3500 },

      // 文件柜系列
      { name: '得力钢制文件柜资料柜', type: '文件柜', baseCost: 600 },
      { name: '金柜指纹密码保密柜', type: '文件柜', baseCost: 1500 },
      { name: '洛克菲勒移动文件柜', type: '文件柜', baseCost: 800 },
      { name: '欧奥森办公室储物柜', type: '文件柜', baseCost: 700 },
      { name: '震旦办公文件矮柜', type: '文件柜', baseCost: 900 },

      // 沙发系列
      { name: 'MUJI无印良品办公沙发', type: '沙发', baseCost: 2500 },
      { name: 'HAY Mags模块化沙发', type: '沙发', baseCost: 3500 },
      { name: '联邦家私现代简约沙发', type: '沙发', baseCost: 1800 },
      { name: '优渡北欧风格休闲沙发', type: '沙发', baseCost: 2000 },
      { name: '慕尼黑接待室沙发组合', type: '沙发', baseCost: 4000 },

      // 工位系列
      { name: '震旦ANT-P2屏风工位', type: '工位', baseCost: 1500 },
      { name: '欧丽四人位办公桌工位', type: '工位', baseCost: 1200 },
      { name: '优渡现代简约职员工位', type: '工位', baseCost: 1000 },
      { name: '圣奥钢架组合工位', type: '工位', baseCost: 1300 },
      { name: '联邦家私屏风卡座工位', type: '工位', baseCost: 1400 }
    ];

    for (let i = 0; i < COUNT; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const costPrice = +(product.baseCost * (0.9 + Math.random() * 0.2)).toFixed(2);
      const markup = 1.3 + Math.random() * 0.4; // 30%-70%的加价率
      
      const data = {
        name: product.name,
        product_code: `P${String(i + 1).padStart(4, '0')}`,
        unit_price: +(costPrice * markup).toFixed(2),
        cost_price: costPrice,
        combination: ['单品', '单品', '单品', '组合', '套装'][Math.floor(Math.random() * 5)]
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