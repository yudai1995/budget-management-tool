import React, { useState } from 'react';
import { Header } from './Components/Header';
import { InputForm } from './Components/InputForm';
import { BalanceType, Balance, sumAmount } from './Model/budget.model';
import { Graph } from './Components/Graph'


const App: React.FC = () => {
  const [moneyList, setMoneyList] = useState<Balance[]>([]);

  const addHandler = (newAmount: number, newType: BalanceType, newContent: string) => {
    const newItem = new Balance(Math.random().toString(), newAmount, newType, newContent);
    setMoneyList(prevmoneyList => [newItem, ...prevmoneyList]);
  }

  return (
    <div className="App">
      <Header/>
      <main>
        <InputForm onSubmitHandler={addHandler} />

        <p>収入</p>
        <p>{sumAmount(moneyList, 'income')}</p>

        <p>支出</p>
        <p>{sumAmount(moneyList, 'outgo')}</p>
        
        <Graph moneyList={moneyList}/>
      </main>
    </div>
  );
}

export default App;
