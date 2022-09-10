if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const Budget = require('../models/budget.ts');

const mysql = require('mysql');
const CLEARDB_URL = process.env.CLEARDB_DATABASE_URL;

//Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const sql =
  'CREATE TABLE IF NOT EXISTS budget_list (id VARCHAR(255) NOT NULL PRIMARY KEY, amount INT NOT NULL, balanceType INT NOT NULL, content VARCHAR(255) NOT NULL, date VARCHAR(255) NOT NULL, categoryId INT NOT NULL)';
pool.query(sql, (error, results, fields) => {
  if (error) throw error;
});

exports.createBudget = (req, res, next) => {
  const reqData = req.body.newData;
  const newBudget = new Budget(
    reqData.id,
    reqData.amount,
    reqData.balanceType,
    reqData.content,
    reqData.date,
    reqData.categoryId
  );

  pool.getConnection((error, connection) => {
    connection.query(
      'insert into budget_list(id, amount, balanceType, content, date, categoryId) values(?, ?, ?, ?, ?, ?)',
      [
        newBudget.id,
        newBudget.amount,
        newBudget.balanceType,
        newBudget.content,
        newBudget.date,
        newBudget.categoryId,
      ],
      (error, results, fields) => {
        if (error) {
          console.log(`createBudget Error: ${error}`);
          throw error;
        }
        res
          .status(200)
          .json({ message: 'created Budget', createdBudge: newBudget });

        connection.release();
        // Handle error after the release.
        if (error) throw error;
      }
    );
  });
};

exports.getBudget = (req, res, next) => {
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM budget_list', (error, results, fields) => {
      if (error) {
        console.log(`getBudget Error: ${error}`);
        throw error;
      }

      res.status(200).json({ budget: results });

      connection.release();
      if (error) throw error;
    });
  });
};

exports.updateBudget = (req, res, next) => {
  const budgetId = req.params.id;
  const updateBudget = new Budget(
    budgetId,
    req.body.amount,
    req.body.balanceType,
    req.body.content,
    req.body.date,
    req.body.categoryId
  );

  pool.getConnection((error, connection) => {
    connection.query(
      'UPDATE budget_list SET amount=?, balanceType=?, content=?, date=?, categoryId=? WHERE id=?',
      [
        updateBudget.amount,
        updateBudget.balanceType,
        updateBudget.content,
        updateBudget.date,
        updateBudget.categoryId,
        updateBudget.id,
      ],
      (error, result, fields) => {
        if (error) {
          console.log(`updateBudget Error: ${error}`);
          throw error;
        }
        res
          .status(200)
          .json({ message: 'updated Budget', updatedBudget: updateBudget });

        connection.release();
        if (error) throw error;
      }
    );
  });
};

exports.deleteBudget = (req, res, next) => {
  const budgetId = req.params.id;

  pool.getConnection((error, connection) => {
    connection.query(
      'DELETE from budget_list WHERE id = ?',
      budgetId,
      (error, result, fields) => {
        if (error) {
          console.log(`deleteBudget Error: ${error}`);
          throw error;
        }
        res.status(200).json({ message: 'Deleted Budget' });

        connection.release();
        if (error) throw error;
      }
    );
  });
};
