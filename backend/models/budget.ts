module.exports = class Budget {
  id;
  amount;
  balanceType;
  content;
  date;
  categoryId;

  constructor(
    // public id: string,
    // public amount: number,
    // public balanceType: 0 | 1,
    // public content: string,
    // public date: string,
    // public categoryId: number

    id,
    amount,
    balanceType,
    content,
    date,
    categoryId
  ) {
    this.id = id;
    this.amount = amount;
    this.balanceType = balanceType;
    this.content = content;
    this.date = date;
    this.categoryId = categoryId;
  }
};

const a =
{
    "id": 1,
    "amount": 200,
     "balanceType": 0,
  "content": "",
  "date": 2010-12-1,
  "categoryId": 2
}