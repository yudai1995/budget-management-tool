import React, { useState } from 'react';
import { Header } from './Components/Header';
import { InputForm } from './Components/InputForm';
import {
    BalanceType,
    Balance,
} from './Model/budget.model';
import { Graph } from './Components/Graph';
import { ItemList } from './Components/ItemList';
import { Result } from './Components/Result';

const App: React.FC = () => {
    const [moneyList, setMoneyList] = useState<Balance[]>([]);
    const [date, setDate] = useState(new Date());

    const addHandler = (
        newAmount: number,
        newType: BalanceType,
        newContent: string,
        newDate: Date
    ) => {
        const newItem = new Balance(
            Math.random().toString(),
            newAmount,
            newType,
            newContent,
            newDate
        );
        setMoneyList((prevmoneyList) => [newItem, ...prevmoneyList]);
    };

    const handlerPrevMonth = () => {
        const year = date.getFullYear();
        const month = date.getMonth() - 1;
        const day = date.getDate();
        setDate(new Date(year, month, day));
    };

    const handlerNextMonth = () => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        setDate(new Date(year, month, day));
    };

    const filterActiveMonth = () => {
        return moneyList.filter(
            (item) => item.date.getMonth() === date.getMonth()
        );
    };

    return (
        <div className="App">
            <Header
                date={date}
                onPrevMonth={handlerPrevMonth}
                onNextMonth={handlerNextMonth}
            />
            <main>
                <div className="inner">
                    <div className="topWrapper">
                        <Graph moneyList={filterActiveMonth()} />
                        <InputForm onSubmitHandler={addHandler} />
                    </div>

                    <Result filterActiveMonth={filterActiveMonth}  date={date}/>


                    {/* <section>
                        <h2 className="result-ttl">{`${
                            date.getMonth() + 1 === thisMonth
                                ? '今'
                                : date.getMonth() + 1
                        }月の${
                            date.getMonth() + 1 > thisMonth ? '計画' : '結果'
                        }`}</h2>
                        <ul className="monthlyResult">
                            {balanceType.map((type, index) => (
                                <li key={index}>
                                    <h3>{`今月の${type.typename}`}</h3>
                                    <p>
                                        {`${
                                            index === 0 ? '+' : '-'
                                        } ${sumAmount(
                                            filterActiveMonth(),
                                            index
                                        )}円`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        </section> */}

                        <ItemList moneyList={filterActiveMonth()}></ItemList>
                    
                </div>
            </main>
        </div>
    );
};

export default App;
