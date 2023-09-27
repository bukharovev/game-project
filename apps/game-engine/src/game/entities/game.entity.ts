import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  readonly id: number;

  // ongoing -> scoring
  // ongoing -> failed
  // scoring -> ended
  // scoring -> failed
  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  scoringStartedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;
}
