const COUNT = 5000;

const generateRandomData = async () => {
  const startTime = new Date().getTime(); // Start time

  const products = ['笔记本电脑', '智能手机', '平板电脑', '智能手表', '耳机', '显示器', '键盘', '鼠标', '打印机', '路由器',
    '摄像头', '移动硬盘', '固态硬盘', '机械硬盘', '显卡', '内存条', '电源', '机箱', '散热器', '主板'];

  const types = ['直接销售', '代理销售', '电商平台', '零售', '批发', '团购', '促销', '预售', '二手', '租赁',
    '以旧换新', '分期付款', '会员专享', '限时特惠', '套装优惠', '样品销售', '清仓特卖', '企业采购', '政府采购', '国际贸易'];

  const combinations = ['标准版', '豪华版', '至尊版', '入门版', '商务版', '游戏版', '专业版', '定制版', '限量版', '纪念版',
    '典藏版', '简约版', '高配版', '低配版', '特供版', '出口版', '内销版', '工程版', '教育版', '企业版'];

  // const products = ['笔记本电脑', '智能手机', '平板电脑', '智能手表', '内存条', '电源', '机箱', '散热器', '主板'];
  
  // const types = ['直接销售', '代理销售'];
  
  // const combinations = ['标准版', '豪华版'];

  const regions = ['华东', '华南', '华北', '华中', '西南', '西北', '东北', '港澳台'];
  // const regions = ['华东', '华南'];
  const channels = ['线下门店', '官方商城', '天猫', '京东', '拼多多', '抖音', '快手', '微信小程序', '实体代理商', '电话销售'];
  const paymentMethods = ['支付宝', '微信支付', '银行卡', '现金', '分期付款', '企业支付', '公务卡', '预付款'];
  
  // 客户数据(15个固定客户)
  const customers = [
    { id: 1, name: '张三', company: '科技有限公司', email: 'zhangsan@tech.com', phone: '13800138001' },
    { id: 2, name: '李四', company: '贸易有限公司', email: 'lisi@trade.com', phone: '13800138002' },
    { id: 3, name: '王五', company: '制造有限公司', email: 'wangwu@mfg.com', phone: '13800138003' },
    { id: 4, name: '赵六', company: '服务有限公司', email: 'zhaoliu@service.com', phone: '13800138004' },
    { id: 5, name: '钱七', company: '零售有限公司', email: 'qianqi@retail.com', phone: '13800138005' },
    { id: 6, name: '孙八', company: '物流有限公司', email: 'sunba@logistics.com', phone: '13800138006' },
    { id: 7, name: '周九', company: '教育科技公司', email: 'zhoujiu@edu.com', phone: '13800138007' },
    { id: 8, name: '吴十', company: '医疗器械公司', email: 'wushi@medical.com', phone: '13800138008' },
    { id: 9, name: '郑十一', company: '建筑工程公司', email: 'zheng11@construction.com', phone: '13800138009' },
    { id: 10, name: '王十二', company: '食品有限公司', email: 'wang12@food.com', phone: '13800138010' },
    { id: 11, name: '李十三', company: '能源有限公司', email: 'li13@energy.com', phone: '13800138011' },
    { id: 12, name: '张十四', company: '环保科技公司', email: 'zhang14@env.com', phone: '13800138012' },
    { id: 13, name: '刘十五', company: '金融服务公司', email: 'liu15@finance.com', phone: '13800138013' },
    { id: 14, name: '陈十六', company: '农业科技公司', email: 'chen16@agri.com', phone: '13800138014' },
    { id: 15, name: '杨十七', company: '文化传媒公司', email: 'yang17@media.com', phone: '13800138015' }
  ];

  const customerTypes = ['个人', '企业', '政府', '教育机构'];
  const customerLevels = ['普通会员', '银卡会员', '金卡会员', '钻石会员'];
  const customerAgeRanges = ['18-25', '26-35', '36-45', '46-55', '56以上'];
  const customerOccupations = ['学生', '上班族', '自由职业', '企业主', '公务员', '教师', '医生', '其他'];

  const mockData = [];

  for (let i = 0; i < COUNT; i++) {
    // 随机选择一个客户
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // 扩展时间维度，3年的数据
    const createDate = new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
    const inquiryTime = new Date(createDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // 询价时间
    const quotationTime = new Date(inquiryTime.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000); // 报价时间
    const orderDate = new Date(createDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // 下单时间
    const paymentTime = new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 付款时间
    const deliveryDate = new Date(paymentTime.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000); // 发货时间
    const receiveTime = new Date(deliveryDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000); // 收货时间
    const reviewTime = new Date(receiveTime.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000); // 评价时间

    const quantity = Math.floor(Math.random() * 100) + 1;
    const unitPrice = +(Math.random() * 1000).toFixed(2);
    const discount = +(Math.random() * 0.5).toFixed(2);
    const actualPrice = +(unitPrice * (1 - discount)).toFixed(2);
    const totalAmount = +(quantity * actualPrice).toFixed(2);
    const costPrice = +(unitPrice * (Math.random() * 0.4 + 0.3)).toFixed(2); // 成本价格
    const profit = +(actualPrice - costPrice).toFixed(2); // 单件利润
    const totalProfit = +(profit * quantity).toFixed(2); // 总利润
    const paymentAmount = +(totalAmount * (Math.random() * 0.2 + 0.9)).toFixed(2); // 实际付款金额（可能有额外费用或优惠）
    const receivedAmount = +(paymentAmount * (Math.random() * 0.1 + 0.9)).toFixed(2); // 实际收款金额（可能有手续费等扣除）

    // 生成客户购买次数和总消费金额
    const purchaseCount = Math.floor(Math.random() * 50) + 1;
    const totalSpent = +(Math.random() * 100000).toFixed(2);
    const avgOrderAmount = +(totalSpent / purchaseCount).toFixed(2);

    mockData.push({
      id: i + 1,
      productName: products[Math.floor(Math.random() * products.length)],
      productCode: `SKU${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      amount: totalAmount,
      paymentAmount: paymentAmount,
      receivedAmount: receivedAmount,
      unitPrice: unitPrice,
      actualPrice: actualPrice,
      costPrice: costPrice,
      profit: profit,
      totalProfit: totalProfit,
      quantity: quantity,
      discount: discount,
      // 扩展的时间维度
      inquiryTime: inquiryTime.toISOString(),
      quotationTime: quotationTime.toISOString(),
      createTime: createDate.toISOString(),
      orderTime: orderDate.toISOString(),
      paymentTime: paymentTime.toISOString(),
      deliveryTime: deliveryDate.toISOString(),
      receiveTime: receiveTime.toISOString(),
      reviewTime: reviewTime.toISOString(),
      // 时间间隔（天数）
      quotationDelay: Math.floor((quotationTime - inquiryTime) / (24 * 60 * 60 * 1000)),
      orderDelay: Math.floor((orderDate - createDate) / (24 * 60 * 60 * 1000)),
      paymentDelay: Math.floor((paymentTime - orderDate) / (24 * 60 * 60 * 1000)),
      deliveryDelay: Math.floor((deliveryDate - paymentTime) / (24 * 60 * 60 * 1000)),
      totalProcessDays: Math.floor((reviewTime - inquiryTime) / (24 * 60 * 60 * 1000)),
      // 年度统计用
      year: createDate.getFullYear(),
      quarter: Math.floor(createDate.getMonth() / 3) + 1,
      month: createDate.getMonth() + 1,
      week: Math.ceil(createDate.getDate() / 7),
      dayOfWeek: createDate.getDay(),
      // 其他维度
      relationType: types[Math.floor(Math.random() * types.length)],
      combination: combinations[Math.floor(Math.random() * combinations.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: ['待付款', '已付款', '已发货', '已签收', '已退款', '已取消'][Math.floor(Math.random() * 6)],
      isVIP: Math.random() > 0.7,
      isCouponUsed: Math.random() > 0.5,
      isFirstPurchase: Math.random() > 0.8,
      returnRate: +(Math.random() * 0.1).toFixed(3),
      customerSatisfaction: Math.floor(Math.random() * 5) + 1,
      profitMargin: +(Math.random() * 0.4 + 0.1).toFixed(2),
      // 客户信息
      customerId: customer.id,
      customerName: customer.name,
      customerCompany: customer.company,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerType: customerTypes[Math.floor(Math.random() * customerTypes.length)],
      customerLevel: customerLevels[Math.floor(Math.random() * customerLevels.length)],
      customerAge: customerAgeRanges[Math.floor(Math.random() * customerAgeRanges.length)],
      customerOccupation: customerOccupations[Math.floor(Math.random() * customerOccupations.length)],
      purchaseCount: purchaseCount,
      totalSpent: totalSpent,
      avgOrderAmount: avgOrderAmount,
      lastPurchaseDate: new Date(createDate.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDate: new Date(createDate.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      hasReturned: Math.random() > 0.8,
      preferredPaymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      hasComplaints: Math.random() > 0.9,
      recommendationScore: Math.floor(Math.random() * 10) + 1
    });
  }

  const endTime = new Date().getTime(); // End time
  console.log(`Execution time: ${endTime - startTime}ms`); // Execution time

  return mockData;
};

export const mockData = generateRandomData;
