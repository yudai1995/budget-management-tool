import axios from 'axios'
import { validate } from 'class-validator'
import classNames from 'classnames/bind'
import ja from 'date-fns/locale/ja'
import React, { useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { balanceType, BalanceTypes, Budget, getRandomID } from '../Model/budget.model'
import { getTypeNumber } from '../Model/Category.model'
import { DateModel, formatDate } from '../Model/Date.model'
import { pageTitle } from '../Model/navigation.model'
import { RootState } from '../store'
import { addBudget } from '../store/budgetListSlice'
import { RequestData, RequestDataFailed, RequestDataSuccess } from '../store/FetchingStateSlice'
import styles from '../styles/Edit.module.scss'
import { ColumnLayout } from './Layout/Column/ColumnLayout'
import { ContentLayout } from './Layout/ContentLayout'

export const Edit: React.FC = () => {
    const location = useLocation()
    const [inputAmount, setInputAmount] = useState('')
    const [inputContent, setInputContent] = useState('')

    const [activeTab, setActiveaTab] = useState(balanceType[0].typename)

    const [targetDate, setTargetDate] = useState(location.state ? (location.state as { date: Date }).date : new Date())
    const [selectCategory, setSelectCategory] = useState(0)

    registerLocale('ja', ja)

    const categoryList = useSelector((state: RootState) => state.CategoryList.data)

    const onClickCategoryHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault()

        setSelectCategory(+event.currentTarget.dataset.id!)
        const ele = document.getElementById('submitBtn')!
        ele.focus()
    }

    const dispatch = useDispatch()

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault()
        const newID = getRandomID(),
            newAmount = +inputAmount,
            newType = balanceType.findIndex((type) => type.typename === activeTab),
            newContent = inputContent,
            newCategory = selectCategory,
            newDate = formatDate(targetDate, DateModel.YY_MM_DD)

        const newData = new Budget(newID, newAmount, newType, newContent, newDate, newCategory)

        // バリデーション
        validate(newData)
            .then((errors) => {
                if (errors.length > 0) {
                    throw errors
                }

                dispatch(RequestData({}))
                // POSTリクエスト
                axios
                    .post('/api/budget', {
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
                        )
                        setInputAmount('')
                        setInputContent('')
                        dispatch(RequestDataSuccess({}))
                    })
                    .catch((err) => {
                        console.log(err)
                        dispatch(RequestDataFailed({}))
                    })
            })

            // バリエーションエラーハンドラ
            .catch((err) => {
                if (err.length > 0) {
                    err.forEach((err: any) => {
                        if (err.property === 'categoryId') {
                            alert('カテゴリが未選択です')
                        } else if (err.property === 'amount') {
                            alert('再度入力してください')
                        } else {
                            alert('入力エラーです')
                        }
                    })
                }
            })
    }

    // タブに付与するclassの切り替え
    const tabCx = classNames.bind(styles)
    const tabClass = (typename: BalanceTypes['typename']) => {
        return tabCx({
            typeTab: true,
            isActive: typename === balanceType[0].typename,
        })
    }

    // カテゴリボタンに付与するclassの切り替え
    const categoryCx = classNames.bind(styles)
    const categoryClass = (categoryId: number) => {
        return categoryCx({
            categoryBtn: true,
            isActive: categoryId === selectCategory,
        })
    }
    const title = pageTitle.Edit

    return (
        <>
            <Helmet>
                <meta name="description" content={`家計簿管理の${title}画面です`} />
                <meta name="keywords" content={`家計簿, 支出管理, ${title}`} />
                <meta property="og:title" content={`${title} | 家計簿管理`} />
                <meta property="og:description" content={`家計簿管理の${title}画面です`} />
                <title>{`${title} | 家計簿管理`}</title>
            </Helmet>
            <ContentLayout title="収支の入力">
                <form onSubmit={newItemSubmitHandler} className={styles.editForm}>
                    <div
                        className={tabClass(activeTab)}
                        onClick={() =>
                            setActiveaTab((prevState) => (prevState === balanceType[0].typename ? balanceType[1].typename : balanceType[0].typename))
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
                    <ColumnLayout width={[50, 50]}>
                        {
                            <>
                                <div className={classNames.call(this, `${styles.inputDate} ${styles.input}`)}>
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
                                <div className={classNames.call(this, `${styles.inputDate} ${styles.input}`)}>
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

                                <div className={classNames.call(this, `${styles.inputContent} ${styles.input}`)}>
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
                            </>
                        }
                        {
                            <div className={classNames.call(this, `${styles.inputCategory} ${styles.input}`)}>
                                <label htmlFor="category" className={styles.label}>
                                    カテゴリ
                                </label>
                                <ul className={`${styles.categoryList} ${styles.editArea}`}>
                                    {categoryList[getTypeNumber(activeTab)].map((category) => (
                                        <li key={category.categoryId} className={`category${category.categoryId} ${styles.category}`}>
                                            <button
                                                onClick={onClickCategoryHandler}
                                                data-id={category.categoryId}
                                                className={categoryClass(category.categoryId)}
                                                style={{
                                                    color: `${category.color}`,
                                                }}
                                            >
                                                {category.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        }
                    </ColumnLayout>
                    <div className={styles.buttonWrapper}>
                        <button type="submit" className={styles.submitBtn} id="submitBtn">
                            追加する
                        </button>
                    </div>
                </form>
            </ContentLayout>
        </>
    )
}
