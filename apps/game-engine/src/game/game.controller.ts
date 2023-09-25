import { Body, Controller, Post } from '@nestjs/common';

import { GameService } from './game.service';
import { MakeBetDto } from './dto/make-bet.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('make-bet')
  makeBet(@Body() makeBetDto: MakeBetDto) {
    return this.gameService.makeBet(makeBetDto);
  }
}
