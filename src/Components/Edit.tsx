import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addBudget } from '../store/budgetListSlice';
import { validate } from 'class-validator';
import DatePicker, { registerLocale } from 'react-datepicker';
import ja from 'date-fns/locale/ja';
import classNames from 'classnames';
import { Budget, balanceType, getRandomID } from '../Model/budget.model';
import { DateModel, formatDate } from '../Model/Date.model';
import { getTypeNumber } from '../Model/Category.model';
import { ContentLayout } from './Layout/ContentLayout';
import { ColumnLayout } from './Layout/Column/ColumnLayout';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Edit.scss';
import { useLocation} from 'react-router';

export const Edit: React.FC = () => {
    const location = useLocation();
    const amountInputRef = useRef<HTMLInputElement>(null);
    const contentInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveaTab] = useState(balanceType[0].typename);
    
    const [targetDate, setTargetDate] = useState(location.state ? (location.state as {date: Date}).date : new Date());
    const [selectCategory, setSelectCategory] = useState(0);
    registerLocale('ja', ja);

    const categoryList = useSelector(
        (state: RootState) => state.CategoryList.data
    );

    const onClickCategoryHandler = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();

        setSelectCategory(+event.currentTarget.dataset.id!);
        const ele = document.getElementById('submitBtn')!;
        ele.focus();
    };

    const dispatch = useDispatch();

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        const newAmount = +amountInputRef.current!.value;
        const newContent = contentInputRef.current!.value;
        const newType = balanceType.findIndex(
            (type) => type.typename === activeTab
        );
        const newCategory = selectCategory;

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

    return (
        <>
            <ContentLayout title="収支の入力">
                <form onSubmit={newItemSubmitHandler}>
                    <ColumnLayout width={[50, 50]}>
                        {
                            <>
                                <ul className="tabList">
                                    {balanceType.map((type, index) => (
                                        <li
                                            key={index}
                                            className={classNames({
                                                isActive:
                                                    activeTab === type.typename,
                                            })}
                                            onClick={() =>
                                                setActiveaTab(type.typename)
                                            }
                                        >
                                            {type.typename}
                                        </li>
                                    ))}
                                </ul>
                                <div
                                    className={classNames('inputDate', 'input')}
                                >
                                    <label htmlFor="date">日付</label>
                                    <DatePicker
                                        dateFormat="yyyy/MM/dd"
                                        selected={targetDate}
                                        locale="ja"
                                        onChange={(date: Date) =>
                                            setTargetDate(date)
                                        }
                                        id="date"
                                    />
                                </div>
                                <div
                                    className={classNames(
                                        'inputAmount',
                                        'input'
                                    )}
                                >
                                    <label htmlFor="amount">金額</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        ref={amountInputRef}
                                        placeholder="金額をご入力ください"
                                        min={1}
                                    />
                                </div>

                                <div
                                    className={classNames(
                                        'inputContent',
                                        'input'
                                    )}
                                >
                                    <label htmlFor="content">内容</label>
                                    <input
                                        type="text"
                                        id="content"
                                        ref={contentInputRef}
                                        placeholder="内容をご入力ください"
                                    />
                                </div>
                            </>
                        }
                        {
                            <div
                                className={classNames('inputContent', 'input')}
                            >
                                <label htmlFor="category">カテゴリ</label>
                                <ul id="category">
                                    {categoryList[getTypeNumber(activeTab)].map(
                                        (category) => (
                                            <li
                                                key={category.categoryId}
                                                className={`category${category.categoryId}`}
                                            >
                                                <button
                                                    onClick={
                                                        onClickCategoryHandler
                                                    }
                                                    data-id={
                                                        category.categoryId
                                                    }
                                                >
                                                    {category.name}
                                                </button>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        }
                    </ColumnLayout>
                    <button type="submit" id="submitBtn" className="submitBtn">
                        追加する
                    </button>
                </form>
            </ContentLayout>
        </>
    );
};
