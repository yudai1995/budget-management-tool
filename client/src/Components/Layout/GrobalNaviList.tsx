import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from '../../styles/GrobalNaviList.module.scss'
import { grobalNavi } from '../../Model/navigation.model'

export const GrobalNaviList: React.FC = () => {
    return (
        <ul className={styles.grobalNavi}>
            {grobalNavi.map((navi) => (
                <li className={styles.grobalNaviList} key={navi.link}>
                    {navi.link === 'report' ? (
                        <NavLink activeClassName={styles.active} to={`/${navi.link}`}>
                            <span className={styles.grobalNaviList_bg}>{navi.title}</span>
                        </NavLink>
                    ) : (
                        <NavLink activeClassName={styles.active} to={`/${navi.link}`} exact>
                            <span className={styles.grobalNaviList_bg}>{navi.title}</span>
                        </NavLink>
                    )}
                </li>
            ))}
        </ul>
    )
}
