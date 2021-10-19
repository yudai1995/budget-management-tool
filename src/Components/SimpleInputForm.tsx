import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
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
    const categorySelectRef = useRef<HTMLSelectElement>(null);
    const [activeTab, setActiveaTab] = useState(balanceType[0].typename);
    const [activeDate, setActiveDate] = useState(new Date());

    const categoryList = useSelector(
        (state: RootState) => state.CategoryList.data
    );

    const dispatch = useDispatch();

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        const newAmount = +amountInputRef.current!.value;
        const newContent = contentInputRef.current!.value;
        const newType = balanceType.findIndex(
            (type) => type.typename === activeTab
        );
        const newCategory = +categorySelectRef.current!.value;

        const newDate = formatDate(activeDate, DateModel.YY_MM_DD);

        const newItem = new Budget(
            getRandomID(),
            newAmount,
            newType,
            newContent,
            newDate,
            newCategory
        );

        validate(newItem)
            .then((errors) => {
                if (errors.length > 0) {
                    throw errors;
                }
                dispatch(
                    addBudget({
                        newAmount,
                        newType,
                        newContent,
                        newDate,
                        newCategory,
                    })
                );
            })
            .catch((err) => {
                if (err.length > 0) {
                    err.forEach((err: any) => {
                        if (err.property === 'categoryId') {
                            alert('カテゴリが未選択です');
                        } else if (err.property === 'amount') {
                            alert('再度入力してください');
                        } else {
                            alert('入力エラーです');
                        }
                    });
                    
                }
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
                <div className={classNames('inputDate', 'input')}>
                    <label htmlFor="content">日付</label>
                    <DatePicker
                        dateFormat="yyyy/MM/dd"
                        selected={activeDate}
                        //maxDate={inputDate}
                        onChange={(date: Date) => setActiveDate(date)}
                    />
                </div>
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
                    <label htmlFor="content">カテゴリ</label>
                    <select
                        name="category"
                        id="category"
                        ref={categorySelectRef}
                    >
                        {categoryList.map((category) => (
                            <option
                                className={`category${category.categoryId}`}
                                value={category.categoryId}
                                key={category.categoryId}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
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
                <button type="submit" className="submitBtn">
                    追加する
                </button>
            </form>
        </>
    );
};
