import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserDataModel } from './UserDataModel';

/** budget_list テーブルに対応するTypeORMエンティティ（インフラ層専用） */
@Entity({ name: 'budget_list' })
export class BudgetDataModel {
    @PrimaryColumn({ type: 'varchar', length: 255, name: 'id' })
    id: string;

    @Column({ type: 'int', name: 'amount' })
    amount: number;

    @Column({ type: 'enum', enum: [0, 1], name: 'balanceType' })
    balanceType: 0 | 1;

    @Column({ type: 'varchar', length: 255, name: 'userId' })
    userId: string;

    @ManyToOne(
        () => UserDataModel,
        (user) => user.budgets,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: UserDataModel;

    @Column({ type: 'int', default: 1, name: 'categoryId' })
    categoryId: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'content' })
    content: string | null;

    @Column({ type: 'varchar', length: 255, name: 'date' })
    date: string;

    @CreateDateColumn({ type: 'datetime', precision: 6, update: false, name: 'createdDate' })
    createdDate: Date;

    @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updatedDate' })
    updatedDate: Date;

    @DeleteDateColumn({ type: 'datetime', precision: 6, name: 'deletedDate' })
    deletedDate: Date | null;
}
