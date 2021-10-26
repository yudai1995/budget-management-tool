import React from 'react';
import styles from '../styles/Footer.module.scss';

export const Footer: React.FC = () => {
    return (
        <footer className={styles.footerMenu}>
            <div className="inner">
                <small>&copy; 2021 YUDAI1995</small>
            </div>
        </footer>
    );
};
