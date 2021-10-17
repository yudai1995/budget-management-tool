import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { SimpleInputForm } from './SimpleInputForm';
import { RecentGraph } from './Graph';
import { TodayResult, RecentResult } from './Result';
import '../styles/ColumnLayout.scss';
import { Budget } from '../Model/budget.model';

interface ColumnLayoutProp {
    children: [React.ReactElement, React.ReactElement];
}
export const ColumnLayout: React.FC<ColumnLayoutProp> = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <div className="subColumn" style={{ flex: '1 1 40%' }}>
                {children[0]}
            </div>
            <div
                className="mainColumn"
                style={{
                    flex: '1 1 60%',
                    marginLeft: '10px',
                }}
            >
                {children[1]}
            </div>
        </div>
    );
};

export const SubColumn: React.FC = () => {
    return (
        <>
            <ContentLayout title="本日の収支">
                <TodayResult />
            </ContentLayout>

            <ContentLayout title="収支の入力">
                <SimpleInputForm />
            </ContentLayout>
        </>
    );
};

export const MainColumn: React.FC = () => {
    return (
        <>
            <Switch>
                <Route exact path="/">
                    <ContentLayout title="直近の収支">
                        <RecentGraph />
                    </ContentLayout>
                    <ContentLayout>
                        <RecentResult />
                    </ContentLayout>
                </Route>
                <Route exact path="/monthly">
                    <section>
                        <h2 className="headTitle">カレンダーページです</h2>
                    </section>
                </Route>
                <Route exact path="/report">
                    <section>
                        <h2 className="headTitle">月間レポート</h2>
                        {/* <div className="activeMonth">
                            <button
                                onClick={props.onPrevMonth}
                                className={classNames('changeMonthBtn', 'prev')}
                            >
                                先月
                            </button>
                            <p className="month">
                                <span>{year}</span>年 <span>{month}</span>月
                            </p>
                            <button
                                onClick={props.onNextMonth}
                                className={classNames('changeMonthBtn', 'next')}
                            >
                                来月
                            </button>
                        </div> */}
                    </section>

                    <section>
                        <h2 className="headTitle">年間レポート</h2>
                    </section>
                </Route>
            </Switch>
        </>
    );
};

interface ContentLayoutProp {
    children: React.ReactElement;
    title?: string;
}
export const ContentLayout: React.FC<ContentLayoutProp> = ({
    children,
    title,
}) => {
    return (
        <section className="content">
            {title ? <h2 className="headTitle">{title}</h2> : <></>}
            {children}
        </section>
    );
};

interface NoDateLayoutProp {
    children: React.ReactElement;
    data: Budget[];
    text?: string;
}
export const NoDateLayout: React.FC<NoDateLayoutProp> = ({
    children,
    data,
    text,
}) => {
    return (
        <>
            {data.length ? (
                children
            ) : (
                <h2>{text ? { text } : 'データがありません'}</h2>
            )}
        </>
    );
};
