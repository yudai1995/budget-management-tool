import React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router';
import styles from '../styles/NotFound.module.scss';

export const NotFound: React.FC = () => {
    const history = useHistory();
    return (
        <div className={styles.notFound}>
            <h2 className={styles.title}>
                <span className={styles.subTitle}>
                    Sorry<span className={styles.errNum}>404</span>
                </span>
                このページは見つかりません。
            </h2>

            <ul className={styles.btnList}>
                <li className={styles.returnBtn}>
                    <Link to="/" className={styles.toHome}>ホームに戻る</Link>
                </li>
                <li className={styles.returnBtn}>
                    <button onClick={() => history.goBack()} className={styles.toBack}>
                        前のページに戻る
                    </button>
                </li>
            </ul>
        </div>
    );
};
