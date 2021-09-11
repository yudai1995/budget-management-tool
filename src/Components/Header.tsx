import React from 'react';
import '../css/Header.scss';

interface HeaderProps {
    date: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
    const year = props.date.getFullYear();
    const month = props.date.getMonth() + 1;

    return (
        <header>
            <div className="inner">
                <h1>Budget</h1>
                <div className="activeMonth">
                    <button
                        onClick={props.onPrevMonth}
                        className="changeMonthBtn"
                    >
                        先月
                    </button>
                    <p className="month">
                        <span>{year}</span>年 <span>{month}</span>月
                    </p>
                    <button
                        onClick={props.onNextMonth}
                        className="changeMonthBtn"
                    >
                        来月
                    </button>
                </div>
            </div>
        </header>
    );
};
