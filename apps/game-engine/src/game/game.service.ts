import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MakeBetDto } from './dto/make-bet.dto';
import { ENDED, FAILED, ONGOING, SCORING } from './game.constants';
import { Game } from './entities/game.entity';
import { assert } from '@libs/helpers/assert';
import { GameNotFound } from './errors/game-not-found.error';
import { GameIsNotAvailable } from './errors/game-is-not-available.error';
import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { Bet } from './entities/bet.entity';
import { ACCEPTED, IN_PROCESS, NOT_ACCEPTED } from './bet.constants';
import { IMakeTransactionResponse, SUCCESS } from '@libs/interfaces/make-transaction.interface';
import path from 'path';

const walletServiceUrl = new URL('http://localhost:3001/api/wallets').toString()
const popUpUrl = path.join(walletServiceUrl, 'pop-up')
const withdrawalUrl = path.join(walletServiceUrl, 'withdrawal')

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Bet)
    private readonly betsRepository: Repository<Bet>,
    private readonly dataSource: DataSource
  ) {}

  async startGame() {
    const data = this.gamesRepository.create({
      status: ONGOING,
    });
    const game = await this.gamesRepository.save(data);

    return game.id;
  }

  async scoreGame(gameId: number) {
    const game = await this.gamesRepository.findOneBy({ id: gameId });
    assert(game, GameNotFound);
    assert(game.status === ONGOING, GameIsNotAvailable);

    await this.dataSource
      .getRepository(Game)
      .createQueryBuilder('games')
      .setLock('pessimistic_write')
      .where('games.id = :gameId ', { gameId })
      .update(Game)
      .set({ status: SCORING, scoringStartedAt: new Date() })
      .execute();

    const acceptedBets = await this.betsRepository.find({
      where: {
        game: { id: gameId },
        status: ACCEPTED,
      },
      relations: {
        game: true,
      },
    });

    const winnerWalletId = this.pickWinner(acceptedBets)?.walletId;
    const winAmount = acceptedBets.reduce(
      (acc: number, bet: Bet) => (acc += bet.amount),
      0
    );
    
    let response: AxiosResponse<IMakeTransactionResponse>;
    try {
      response = await axios.post(popUpUrl, {
        walletId: winnerWalletId,
        amount: winAmount,
      });
    } catch (error) {
      Logger.error(`GameService::scoreGame::${error}`);
    }
    if (response.data.status === SUCCESS) {
      return game;
    }
  }

  pickWinner(bets: Array<Bet>) {
    const winnerIndex = Math.floor(Math.random() * bets.length);

    return bets[winnerIndex];
  }

  async endGame(gameId: number) {
    const game = await this.gamesRepository.findOneBy({ id: gameId });
    assert(game, GameNotFound);
    assert(game.status === SCORING, GameIsNotAvailable);

    await this.dataSource
      .getRepository(Game)
      .createQueryBuilder('games')
      .setLock('pessimistic_write')
      .where('games.id = :gameId ', { gameId })
      // .andWhere('games.status = :status', { status: ONGOING })
      .update(Game)
      .set({ status: ENDED, endedAt: new Date() })
      .execute();
  }

  async failGame(gameId: number) {
    const game = await this.gamesRepository.findOneBy({ id: gameId });
    assert(game, GameNotFound);

    await this.dataSource
      .getRepository(Game)
      .createQueryBuilder('games')
      .setLock('pessimistic_write')
      .where('games.id = :gameId ', { gameId })
      .update(Game)
      .set({ status: FAILED })
      .execute();
  }

  async makeBet(dto: MakeBetDto) {
    // const acceptanceTime = new Date();
    const { walletId, amount, gameId } = dto;
    const game = await this.gamesRepository.findOneBy({ id: gameId });
    assert(game, GameNotFound);
    assert(game.status === ONGOING, GameIsNotAvailable);

    const bet = await this.createBet({
      walletId,
      amount,
      game,
      status: IN_PROCESS,
    });
    // go to the wallet service
    let response: AxiosResponse<IMakeTransactionResponse>;
    try {
      response = await axios.post(withdrawalUrl, {
        walletId,
        amount,
      });
    } catch (err) {
      Logger.error(`GameService::makeBet::${err}`);
      await this.updateBet(bet.id, { status: NOT_ACCEPTED });
      return { status: NOT_ACCEPTED };
    }

    if (response.data.status === SUCCESS) {
      await this.updateBet(bet.id, { status: ACCEPTED });
      return { status: ACCEPTED };
    } else {
      await this.updateBet(bet.id, { status: NOT_ACCEPTED });
      return { status: NOT_ACCEPTED };
    }
  }

  async createBet(data: Omit<Bet, 'id'>) {
    const bet = this.betsRepository.create(data);
    return await this.betsRepository.save(bet);
  }

  async updateBet(id: number, data: Partial<Omit<Bet, 'id'>>) {
    const bet = await this.betsRepository.findOneBy({ id });
    // assert(bet, BetNotFound)
    return this.betsRepository.update(id, data);
  }
}
