import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
