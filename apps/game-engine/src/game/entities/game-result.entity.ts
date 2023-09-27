import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Bet } from './bet.entity';

@Entity()
export class GameResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  winnerWalletId: string;

  @ManyToOne(() => Game, { nullable: false })
  game: number;

  @Column()
  wonAmount: number;

  @CreateDateColumn()
  createdAt: Date;
}
