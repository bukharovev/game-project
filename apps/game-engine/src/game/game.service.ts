import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  EntityManager,
  LessThanOrEqual,
} from 'typeorm';
import { MakeBetDto } from './dto/make-bet.dto';
import { ENDED, FAILED, ONGOING, SCORING } from './game.constants';
import { Game } from './entities/game.entity';
import { assert } from '@libs/helpers/assert';
import { GameNotFound } from './errors/game-not-found.error';
import { GameIsNotAvailable } from './errors/game-is-not-available.error';
import axios, { AxiosInstance } from 'axios';
import { Logger } from '@nestjs/common';
import { Bet } from './entities/bet.entity';

import {
  ACCEPTED,
  IN_PROCESS,
  NOT_ACCEPTED,
  FUNDS_RETURNED,
} from './bet.constants';
import {
  IMakeTransactionResponse,
  SUCCESS,
} from '@libs/interfaces/make-transaction.interface';
import { GameResult } from './entities/game-result.entity';
import { CannotFailEndedGame } from './errors/cannot-fail-game.error';
import { CannotEndGame } from './errors/cannot-end-game.error';
import { CannotScoreGame } from './errors/cannot-score-game.error';

const ONE_MINUTE_IN_MS = 1 * 60 * 1000;
const THREE_MINUTES_IN_MS = 3 * 60 * 1000;

@Injectable()
export class GameService {
  walletApi: AxiosInstance;

  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Bet)
    private readonly betsRepository: Repository<Bet>,
    @InjectRepository(GameResult)
    private readonly gameResultRepository: Repository<GameResult>,
    private readonly dataSource: DataSource
  ) {
    this.walletApi = axios.create({
      baseURL: new URL('http://localhost:3001/api/wallets').toString(),
    });
  }

  async startGame() {
    const data = this.gamesRepository.create({
      status: ONGOING,
      startedAt: new Date(),
    });
    const game = await this.gamesRepository.save(data);

    Logger.log(`game #${game.id} ongoing`);
    return game.id;
  }

  async scoreGame(gameId: number) {
    Logger.log(`scoring game #${gameId}`);
    await this.dataSource.transaction(async (entityManager) => {
      const game = await this.getGameByIdAndLock(gameId, entityManager);
      assert(game.status === ONGOING, CannotScoreGame);

      await this.updateGameWithTransaction(
        gameId,
        { status: SCORING, scoringStartedAt: new Date() },
        entityManager
      );
    });

    const acceptedBets = await this.betsRepository.find({
      where: {
        game: { id: gameId },
        status: ACCEPTED,
      },
    });

    if (acceptedBets.length === 0) {
      return;
    }

    const winner = this.pickWinner(acceptedBets);
    const winnerWalletId = winner.walletId;
    const wonAmount = acceptedBets.reduce(
      (acc: number, bet: Bet) => (acc += bet.amount),
      0
    );

    const popUpResponse = await this.walletApi.post<IMakeTransactionResponse>(
      'pop-up',
      {
        walletId: winnerWalletId,
        amount: wonAmount,
      }
    );

    if (popUpResponse.data?.status === SUCCESS) {
      const gameResult = this.gameResultRepository.create({
        winnerWalletId,
        wonAmount,
        game: gameId,
      });
      await this.gameResultRepository.save(gameResult);
      Logger.log(`game #${gameId} scored`);
    } else {
      throw new Error(
        `cannot pop-up wallet: #${winnerWalletId}, game: #${gameId}`
      );
    }
  }

  async endGame(gameId: number) {
    Logger.log(`ending game #${gameId}`);

    await this.dataSource.transaction(async (entityManager) => {
      const game = await this.getGameByIdAndLock(gameId, entityManager);
      assert(game.status === SCORING, CannotEndGame);

      await this.updateGameWithTransaction(
        gameId,
        { status: ENDED, endedAt: new Date() },
        entityManager
      );
    });

    Logger.log(`game #${gameId} ended`);
  }

  async failGame(gameId: number) {
    Logger.log(`failing game #${gameId}`);

    await this.dataSource.transaction(async (entityManager) => {
      const game = await this.getGameByIdAndLock(gameId, entityManager);
      assert(game.status !== ENDED, CannotFailEndedGame);

      await this.updateGameWithTransaction(
        gameId,
        { status: FAILED, failedAt: new Date() },
        entityManager
      );
    });
    Logger.log(`game #${gameId} failed`);
  }

  async makeBet(dto: MakeBetDto) {
    const acceptanceTime = new Date();
    let bet: Bet;
    try {
      const { walletId, amount, gameId } = dto;
      const game = await this.gamesRepository.findOneBy({ id: gameId });
      assert(game, GameNotFound);
      assert(game.status === ONGOING, GameIsNotAvailable);

      bet = await this.createBet({
        walletId,
        amount,
        game,
        status: IN_PROCESS,
        acceptanceTime,
      });

      const withdrawalResponse =
        await this.walletApi.post<IMakeTransactionResponse>('withdrawal', {
          walletId,
          amount,
        });

      if (withdrawalResponse.data.status === SUCCESS) {
        await this.updateBet(bet.id, { status: ACCEPTED });
        return { status: ACCEPTED };
      } else {
        await this.updateBet(bet.id, { status: NOT_ACCEPTED });
        return { status: NOT_ACCEPTED };
      }
    } catch (error) {
      console.dir({ 'GameService::makeBet': error }, { depth: null });
      if (bet) {
        await this.updateBet(bet.id, { status: NOT_ACCEPTED }).catch((err) =>
          Logger.error(err)
        );
      }
      return { status: NOT_ACCEPTED };
    }
  }

  async returnBetsOfFailedGames() {
    Logger.log('returning bets of failed games');
    const acceptedBets = await this.betsRepository.find({
      where: {
        game: {
          status: FAILED,
          failedAt: LessThanOrEqual(new Date(Date.now() - ONE_MINUTE_IN_MS)),
        },
        status: ACCEPTED,
      },
    });
    for (const bet of acceptedBets) {
      const returnFundsResponse =
        await this.walletApi.post<IMakeTransactionResponse>('pop-up', {
          amount: bet.amount,
          walletId: bet.walletId,
        });
      if (returnFundsResponse.data.status === SUCCESS) {
        await this.updateBet(bet.id, { status: FUNDS_RETURNED });
      }

      Logger.log(`returned: ${acceptedBets.length} bets`);
    }
  }

  async failLongLivedGames() {
    Logger.log('failing long lived games');
    const longLivedGames = await this.gamesRepository.find({
      where: [
        {
          status: ONGOING,
          startedAt: LessThanOrEqual(new Date(Date.now() - THREE_MINUTES_IN_MS)),
        },
        {
          status: SCORING,
          scoringStartedAt: LessThanOrEqual(
            new Date(Date.now() - THREE_MINUTES_IN_MS)
          ),
        },
      ],
    });

    for (const game of longLivedGames) {
      await this.failGame(game.id);
    }
    Logger.log(`failed: ${longLivedGames.length} long lived games`);
  }

  private async getGameByIdAndLock(
    gameId: number,
    entityManager: EntityManager
  ): Promise<Game> {
    return await entityManager
      .getRepository(Game)
      .createQueryBuilder('games')
      .setLock('pessimistic_write')
      .where('games.id = :gameId ', { gameId })
      .getOne();
  }

  private async updateGameWithTransaction(
    gameId: number,
    data: Partial<Omit<Game, 'id'>>,
    entityManager: EntityManager
  ) {
    return await entityManager
      .getRepository(Game)
      .createQueryBuilder('games')
      .update(Game)
      .where('games.id = :gameId ', { gameId })
      .set(data)
      .execute();
  }

  private pickWinner(bets: Array<Bet>) {
    const winnerIndex = Math.floor(Math.random() * bets.length);

    return bets[winnerIndex];
  }

  private async createBet(data: Omit<Bet, 'id'>) {
    const bet = this.betsRepository.create(data);
    return await this.betsRepository.save(bet);
  }

  private async updateBet(id: number, data: Partial<Omit<Bet, 'id'>>) {
    return await this.betsRepository.update(id, data);
  }
}
