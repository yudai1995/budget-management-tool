import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addBudget } from '../store/budgetListSlice';
import { Link } from 'react-router-dom';
import { validate } from 'class-validator';
import DatePicker, { registerLocale } from 'react-datepicker';
import ja from 'date-fns/locale/ja';
import classNames from 'classnames/bind';
import {
    Budget,
    balanceType,
    getRandomID,
    BalanceTypes,
} from '../Model/budget.model';
import { DateModel, formatDate } from '../Model/Date.model';
import { getTypeNumber } from '../Model/Category.model';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/SimpleInputForm.module.scss';

export const SimpleInputForm: React.FC = () => {
    // useRefを実行、このrefを使用しinputDOMオブジェクトにrefオブジェクトを割り当てる
    const amountInputRef = useRef<HTMLInputElement>(null);
    const contentInputRef = useRef<HTMLInputElement>(null);
    const categorySelectRef = useRef<HTMLSelectElement>(null);
    const [activeTab, setActiveaTab] = useState(balanceType[0].typename);
    const [targetDate, setTargetDate] = useState(new Date());
    registerLocale('ja', ja);

    const categoryList = useSelector(
        (state: RootState) => state.CategoryList.data
    );

    const dispatch = useDispatch();

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        const newAmount = +amountInputRef.current!.value;
        const newContent = contentInputRef.current!.value;
        const newType = getTypeNumber(activeTab);
        const newCategory = +categorySelectRef.current!.value;
        const newDate = formatDate(targetDate, DateModel.YY_MM_DD);

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

    // タブに付与するclassの切り替え
    const cx = classNames.bind(styles);
    const tabclass = (typename: BalanceTypes['typename']) => {
        return cx({
            typeTab: true,
            isActive: typename === balanceType[0].typename,
        });
    };

    return (
        <form onSubmit={newItemSubmitHandler} className={styles.editForm}>
            <div
                className={tabclass(activeTab)}
                onClick={() =>
                    setActiveaTab((prevState) =>
                        prevState === balanceType[0].typename
                            ? balanceType[1].typename
                            : balanceType[0].typename
                    )
                }
            >
                <p className={styles.tabCircle}>{activeTab}</p>
                <ul className={styles.tabList}>
                    {balanceType.map((type, index) => (
                        <li key={index} className={styles.tabListItem}>
                            {type.typename}
                        </li>
                    ))}
                </ul>
            </div>

            <div
                className={classNames(`${styles.inputAmount} ${styles.input}`)}
            >
                <label htmlFor="amount" className={styles.label}>
                    金額
                </label>
                <input
                    type="number"
                    id="amount"
                    ref={amountInputRef}
                    placeholder="金額をご入力ください"
                    min={1}
                    max={100000000}
                    className={styles.editArea}
                />
            </div>
            <div className={classNames(`${styles.inputDate} ${styles.input}`)}>
                <label htmlFor="date" className={styles.label}>
                    日付
                </label>
                <DatePicker
                    id="date"
                    dateFormat="yyyy/MM/dd"
                    selected={targetDate}
                    locale="ja"
                    onChange={(date: Date) => setTargetDate(date)}
                    className={styles.editArea}
                />
            </div>
            <div
                className={classNames(
                    `${styles.inputCategory} ${styles.input}`
                )}
            >
                <label htmlFor="category" className={styles.label}>
                    カテゴリ
                </label>
                <select
                    name="category"
                    id="category"
                    ref={categorySelectRef}
                    className={styles.editArea}
                >
                    {categoryList[getTypeNumber(activeTab)].map((category) => (
                        <option
                            value={category.categoryId}
                            key={category.categoryId}
                            className={`category${category.categoryId}`}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            <div
                className={classNames(`${styles.inputContent} ${styles.input}`)}
            >
                <label htmlFor="content" className={styles.label}>
                    内容
                </label>
                <input
                    type="text"
                    id="content"
                    ref={contentInputRef}
                    placeholder="内容をご入力ください(任意)"
                    className={styles.editArea}
                />
            </div>
            <div className={styles.buttonWrapper}>
                <button type="submit" className={styles.submitBtn}>
                    追加する
                </button>
                <Link to="/edit" className={`${styles.toEditBtn} iconBtn next`}>
                    くわしく入力する
                </Link>
            </div>
        </form>
    );
};
