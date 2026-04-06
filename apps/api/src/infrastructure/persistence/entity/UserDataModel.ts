import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm'
import { BudgetDataModel } from './BudgetDataModel'

/** user_list テーブルに対応するTypeORMエンティティ（インフラ層専用） */
@Entity({ name: 'user_list' })
export class UserDataModel {
    @PrimaryColumn({ type: 'varchar', length: 255, name: 'userId' })
    userId: string

    @Column({ type: 'varchar', length: 255, name: 'userName' })
    userName: string

    @Column({ type: 'varchar', length: 255, name: 'password' })
    password: string

    @OneToMany(() => BudgetDataModel, (budget) => budget.user)
    budgets: BudgetDataModel[]
}
