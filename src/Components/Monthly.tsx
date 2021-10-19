import React from 'react';
import '../styles/Monthly.scss';

import { Link } from 'react-router-dom';

interface MonthlyProps {}

export const Monthly: React.FC<MonthlyProps> = () => {
    return (
        <div>
            <Link to="report/2021-10-4">2021/10/4</Link>
        </div>
    );
};
