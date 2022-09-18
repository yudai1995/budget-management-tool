import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({
    name: 'user_list',
  })
export class User {
  @PrimaryColumn({ type: 'varchar' })
  userId: string;

  @Column()
  userName: string;

  @Column()
  password: string;
}
