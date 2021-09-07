import React, { useState } from 'react';
import { Header } from './Components/Header';
import { InputForm } from './Components/InputForm';
import { BalanceType, Balance } from './Model/budget.model';
//import { Graph } from './Components/Graph'


const App: React.FC = () => {
  const [moneyList, setMoneyList] = useState<Balance[]>([]);

  const addHandler = (newAmount: number, newType: BalanceType, newContent: string) => {
    const newItem = new Balance(Math.random().toString(), newAmount, newType, newContent);
    setMoneyList(prevmoneyList => [newItem, ...prevmoneyList]);
    console.log(moneyList);
  }

  const allIncome = moneyList.map(item => {
    let count = 0;
    if (item.type === 'income') {
      count = count + item.amount;
    }
    return count;
  })

  const allOutgo = moneyList.map(item => {
    let count = 0;
    if (item.type === 'outgo') {
      count = count + item.amount;
    }
    return count;
  })


  return (
    <div className="App">
      <Header/>
      <main>
        <InputForm onSubmitHandler={addHandler} />

        <p>収入</p>
        <p>{allIncome}</p>

        <p>支出</p>
        <p>{allOutgo}</p>
      </main>
    </div>
  );
}

export default App;
