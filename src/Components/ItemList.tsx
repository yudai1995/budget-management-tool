import classNames from 'classnames';
import React from 'react';
import { Balance, balanceType, filterMoneyType } from '../Model/budget.model';
import '../css/ItemList.scss';

interface ItemListProps {
    moneyList: Balance[];
}

export const ItemList: React.FC<ItemListProps> = (props) => {
    return (
        <div className="result">
            {balanceType.map((type, index) => (
                <div
                    className={classNames({
                        income: type === '収入',
                        outgo: type === '支出',
                    })}
                >
                    <h3>{type}</h3>
                    <ul>
                        {filterMoneyType(props.moneyList, index).map((item) => (
                            <li key={item.id}>
                                <span className="date">{`${item.date.getMonth()+1}月${item.date.getDate()}日`}</span>
                                <span className="amount">{`${item.content}: ${type === '収入' ? "+" : "-"} ${item.amount}円`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
