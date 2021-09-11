import React, { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { BalanceType, balanceType } from '../Model/budget.model';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/InputForm.scss';

interface InputFormProps {
    onSubmitHandler: (
        newAmount: number,
        newType: BalanceType,
        newContent: string,
        newDate: Date
    ) => void;
}

export const InputForm: React.FC<InputFormProps> = (props) => {
    // useRefを実行、このrefを使用しinputDOMオブジェクトにrefオブジェクトを割り当てる
    const amountInputRef = useRef<HTMLInputElement>(null);
    const contentInputRef = useRef<HTMLInputElement>(null);
    const [inputDate, setInputDate] = useState(new Date());
    const [activeTab, setActiveaTab] = useState(balanceType[0]);

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        const newAmount = +amountInputRef.current!.value;
        const newContent = contentInputRef.current!.value;
        const newType = balanceType.findIndex((type) => type === activeTab);
        props.onSubmitHandler(newAmount, newType, newContent, inputDate);
    };

    const tabClickHandler = (type: string) => {
        setActiveaTab(type);
    };

    return (
        <form onSubmit={newItemSubmitHandler}>
            <ul className="tabList">
                {balanceType.map((type, index) => (
                    <li
                        key={index}
                        className={classNames({ isActive: activeTab === type })}
                        onClick={tabClickHandler.bind(null, type)}
                    >
                        {type}
                    </li>
                ))}
            </ul>

            <div className={classNames("inputAmount", "input")}>
                <label htmlFor="amount">金額</label>
                <input
                    type="number"
                    id="amount"
                    ref={amountInputRef}
                    placeholder="金額をご入力ください"
                />
            </div>

            <div className={classNames("inputContent", "input")}>
                <label htmlFor="content">内容</label>
                <input
                    type="text"
                    id="amount"
                    ref={contentInputRef}
                    placeholder="内容をご入力ください"
                />
            </div>

            <div className={classNames("inputDate", "input")}>
                <label htmlFor="content">日付</label>
                <DatePicker
                    dateFormat="yyyy/MM/dd"
                    selected={inputDate}
                    //maxDate={inputDate}
                    onChange={(date: Date) => setInputDate(date)}
                />
            </div>
            <button type="submit" className="submitBtn">
                追加
            </button>
        </form>
    );
};
