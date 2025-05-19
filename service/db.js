const mysql = require('mysql2');



module.exports = function install(app, dbConnect) {
  async function getDbStructure() {
    try {
      // 获取所有表名
      const tables = await new Promise((resolve, reject) => {
        dbConnect.db.query("SHOW TABLES", (err, results) => {
          if (err) reject(err);
          resolve(results.map(row => row[`Tables_in_${dbConnect.db.config.database}`]));
        });
      });

      const results = {};

      // 获取每个表的结构信息
      for (const table of tables) {
        const columns = await new Promise((resolve, reject) => {
          dbConnect.db.query(`SELECT
	* 
FROM
	information_schema.COLUMNS 
WHERE
	TABLE_NAME = '${table}' 
	AND TABLE_SCHEMA = '${dbConnect.db.config.database}'`, (err, data) => {
            if (err) reject(err);
            resolve(data);
          });
        });

        results[table] = columns;
      }

      return results;
    } catch (err) {
      throw err;
    }
  }

  app.post('/api/db', async (req, res) => {
    const { host, port, userName: user, password, database } = req.body;
    dbConnect.db = mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });
    // 连接数据库
    dbConnect.db.connect((err) => {
      if (err) {
        console.error('数据库连接失败:', err);
        return;
      }
      console.log('数据库连接成功');
    });
    res.send({
      code: 200,
      result: await getDbStructure(),
      message: '数据库连接成功'
    });
  });
}

