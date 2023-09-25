import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class Bet {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  walletId: string;

  @ManyToOne(() => Game, { nullable: false })
  game: Game;

  @Column() // it could be { type: 'money' }
  amount: number;

  @Column()
  status: string;

  @Column({ nullable: true, type: 'timestamp' })
  acceptanceTime?: Date;
}
