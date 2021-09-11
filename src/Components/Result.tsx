import React from 'react';
import { Balance, balanceType, sumAmount } from '../Model/budget.model';
import '../css/Result.scss';

interface ResultProps {
    date: Date;
    filterActiveMonth: () => Balance[];
}

export const Result: React.FC<ResultProps> = (props) => {
    const month = props.date.getMonth() + 1;
    const thisMonth = new Date().getMonth() + 1;
    return (
        <section className="resultSection">
            <h2 className="result-ttl">{`${
                month === thisMonth ? '今' : month
            }月の${month > thisMonth ? '計画' : '結果'}`}</h2>
            <ul className="monthlyResult">
                {balanceType.map((type, index) => (
                    <li key={index}>
                        <h3>{`今月の${type.typename}`}</h3>
                        <p>
                            {`${index === 0 ? '+' : '-'} ${sumAmount(
                                props.filterActiveMonth(),
                                index
                            )}円`}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
};
