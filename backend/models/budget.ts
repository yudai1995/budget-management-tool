module.exports = class Budget {
  id;
  amount;
  balanceType;
  content;
  date;
  categoryId;

  constructor(id, amount, balanceType, content, date, categoryId) {
    this.id = id;
    this.amount = amount;
    this.balanceType = balanceType;
    this.content = content;
    this.date = date;
    this.categoryId = categoryId;
  }
};
