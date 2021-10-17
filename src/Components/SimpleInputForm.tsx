import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addBudget } from '../store/budgetListSlice';
import { validate } from 'class-validator';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { Budget, balanceType, getRandomID } from '../Model/budget.model';
import { DateModel, formatDate } from '../Model/Date.model';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/SimpleInputForm.scss';

export const SimpleInputForm: React.FC = () => {
    // useRefを実行、このrefを使用しinputDOMオブジェクトにrefオブジェクトを割り当てる
    const amountInputRef = useRef<HTMLInputElement>(null);
    const contentInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveaTab] = useState(balanceType[0].typename);
    const [activeDate, setActiveDate] = useState(new Date());

    const dispatch = useDispatch();

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        const newAmount = +amountInputRef.current!.value;
        const newContent = contentInputRef.current!.value;
        const newType = balanceType.findIndex(
            (type) => type.typename === activeTab
        );

        const newDate = formatDate(activeDate, DateModel.YY_MM_DD);

        const newItem = new Budget(
            getRandomID(),
            newAmount,
            newType,
            newContent,
            newDate,
            0
        );

        validate(newItem)
            .then((errors) => {
                if (errors.length > 0) {
                    throw new Error('Error');
                }
                dispatch(
                    addBudget({ newAmount, newType, newContent, newDate })
                );
            })
            .catch((err) => {
                console.log(err);
                alert('再度入力してください');
            });

        amountInputRef.current!.value = '';
        contentInputRef.current!.value = '';
    };

    return (
        <>
            <form onSubmit={newItemSubmitHandler}>
                <ul className="tabList">
                    {balanceType.map((type, index) => (
                        <li
                            key={index}
                            className={classNames({
                                isActive: activeTab === type.typename,
                            })}
                            onClick={() => setActiveaTab(type.typename)}
                        >
                            {type.typename}
                        </li>
                    ))}
                </ul>

                <div className={classNames('inputAmount', 'input')}>
                    <label htmlFor="amount">金額</label>
                    <input
                        type="number"
                        id="amount"
                        ref={amountInputRef}
                        placeholder="金額をご入力ください: 例 1000"
                    />
                </div>

                <div className={classNames('inputContent', 'input')}>
                    <label htmlFor="content">内容</label>
                    <input
                        type="text"
                        id="amount"
                        ref={contentInputRef}
                        placeholder="内容をご入力ください"
                    />
                </div>

                <div className={classNames('inputDate', 'input')}>
                    <label htmlFor="content">日付</label>
                    <DatePicker
                        dateFormat="yyyy/MM/dd"
                        selected={activeDate}
                        //maxDate={inputDate}
                        onChange={(date: Date) => setActiveDate(date)}
                    />
                </div>
                <button type="submit" className="submitBtn">
                    追加する
                </button>
            </form>
            </>
    );
};
