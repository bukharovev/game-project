/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { GameService } from './game/game.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const launchGameInstance = async (gameService: GameService) => {
  let gameId: number;
  try {
    gameId = await gameService.startGame();
    await delay(30_000);
    await gameService.scoreGame(gameId);
    await gameService.endGame(gameId);
  } catch (error) {
    console.dir({ 'launchGameInstance error': error }, { depth: null });
    await gameService
      .failGame(gameId)
      .catch((err) => console.dir({ failGameError: error }, { depth: null }));
  }
};

const failLongLivedGames = async (gameService: GameService) => {
  try {
    await gameService.failLongLivedGames();
  } catch (error) {
    console.dir({ 'failLongLivedGames error': error }, { depth: null });
  }
};

const returnBetsOfFailedGames = async (gameService: GameService) => {
  try {
    await gameService.returnBetsOfFailedGames();
  } catch (error) {
    console.dir({ 'returnBetsOfFailedGames error': error }, { depth: null });
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.listen(port);
  Logger.log(
    `🚀 Game-engine service is running on: http://localhost:${port}/${globalPrefix}`
  );

  const gameService = app.get(GameService);

  launchGameInstance(gameService);
  setInterval(async () => await launchGameInstance(gameService), 30_000);

  setInterval(async () => await failLongLivedGames(gameService), 35_000);
  setInterval(async () => await returnBetsOfFailedGames(gameService), 40_000);
}

bootstrap();
