import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    addBudget,
    RequestData,
    RequestDataSuccess,
    RequestDataFailed,
} from '../store/budgetListSlice';
import { setSelectCategory } from '../store/CategoryListSlice';
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
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/SimpleInputForm.module.scss';

export const SimpleInputForm: React.FC = () => {
    //state
    const [inputAmount, setInputAmount] = useState('');
    const [inputContent, setInputContent] = useState('');
    const [activeTab, setActiveaTab] = useState(balanceType[0].typename);
    const [targetDate, setTargetDate] = useState(new Date());
    registerLocale('ja', ja);

    // カテゴリの取得
    //カテゴリのリスト
    const categoryList = useSelector(
        (state: RootState) => state.CategoryList.data
    );
    //選択中
    const selectCategory = useSelector(
        (state: RootState) => state.CategoryList.selectedCategory
    );

    useEffect(() => {}, [inputAmount, inputContent]);

    // submit時のイベントハンドラ
    const dispatch = useDispatch();
    const newItemSubmitHandler = (event: React.FormEvent) => {
        const newID = getRandomID(),
            newAmount = +inputAmount,
            newContent = inputContent,
            newType = getTypeNumber(activeTab),
            newCategory = selectCategory,
            newDate = formatDate(targetDate, DateModel.YY_MM_DD);

        event.preventDefault();
        const newData = new Budget(
            newID,
            newAmount,
            newType,
            newContent,
            newDate,
            newCategory
        );

        // バリデーション
        validate(newData)
            .then((errors) => {
                if (errors.length > 0) {
                    throw errors;
                }

                dispatch(RequestData({}));
                // POSTリクエスト
                axios
                    .post('/api', {
                        newData,
                    })
                    .then((response) => {
                        dispatch(
                            addBudget({
                                newID,
                                newAmount,
                                newType,
                                newContent,
                                newDate,
                                newCategory,
                            })
                        );
                        dispatch(RequestDataSuccess({}));
                    })
                    .catch((err) => {
                        console.log(err);
                        dispatch(RequestDataFailed({}));
                    });
            })

            // バリエーションエラーハンドラ
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
    };

    const categorySelecedHandler = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        dispatch(
            setSelectCategory({ selectedCategory: +event.currentTarget.value })
        );
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
                    placeholder="金額をご入力ください"
                    min={1}
                    max={100000000}
                    className={styles.editArea}
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
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
                    //ref={categorySelectRef}
                    className={styles.editArea}
                    onChange={(e) => categorySelecedHandler(e)}
                    defaultValue={selectCategory}
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
                    placeholder="内容をご入力ください(任意)"
                    className={styles.editArea}
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
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
