import {
  Column,
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

  // in_process -> accepted
  // in_process -> not_accepted
  // accepted -> funds_returned

  @Column()
  status: string;

  @Column({ nullable: true, type: 'timestamp' })
  acceptanceTime?: Date;
}
