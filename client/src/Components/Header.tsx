import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Header.module.scss';
import Logo from '../img/common/icon-logo.png';

const grobalNavi = [
    {
        text: 'ホーム',
        link: '',
    },
    {
        text: 'カレンダー',
        link: 'monthly',
    },
    {
        text: 'レポート',
        link: 'report',
    },
    {
        text: '入力',
        link: 'edit',
    },
];

export const Header: React.FC = () => {
    return (
        <header className={styles.menuHeader}>
            <div className="inner">
                <div className={styles.headerWrapper}>
                    <h1 className={styles.headerTitle}>
                        <NavLink to="/" className={styles.logo}>
                            <img
                                src={Logo}
                                alt="家計簿管理ツール"
                                width="24"
                                height="24"
                            />
                            家計簿管理ツール
                        </NavLink>
                    </h1>
                    <ul className={styles.grobalNavi}>
                        {grobalNavi.map((navi) => (
                            <GrobalNaviList link={navi.link} key={navi.link}>
                                {navi.text}
                            </GrobalNaviList>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
};

interface grobalNaviListProp {
    children: string;
    link: string;
}

export const GrobalNaviList: React.FC<grobalNaviListProp> = ({
    children,
    link,
}) => {
    return (
        <li className={styles.grobalNaviList} key={link}>
            {link === 'report' ? (
                <NavLink activeClassName={styles.active} to={`/${link}`}>
                    {children}
                </NavLink>
            ) : (
                <NavLink activeClassName={styles.active} to={`/${link}`} exact>
                    {children}
                </NavLink>
            )}
        </li>
    );
};
