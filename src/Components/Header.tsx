import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Header.scss';
import Logo from '../img/common/icon-logo.png';

export const Header: React.FC = () => {
    return (
        <header>
            <div className="inner">
                <h1>
                    <NavLink to="/">
                        <img
                            src={Logo}
                            alt="家計簿管理ツール"
                            width="32"
                            height="32"
                        />
                        家計簿管理ツール
                    </NavLink>
                </h1>

                <ul className="grobalNavi">
                    <li>
                        <NavLink activeClassName="active" exact to="/">
                            ホーム
                        </NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/monthly">
                            カレンダー
                        </NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/report">
                            レポート
                        </NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/edit">
                            入力
                        </NavLink>
                    </li>
                </ul>
            </div>
        </header>
    );
};
