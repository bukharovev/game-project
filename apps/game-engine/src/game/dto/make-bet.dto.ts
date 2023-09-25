import { IsUUID, IsPositive } from 'class-validator';

export class MakeBetDto {
  @IsUUID()
  walletId: string;

  @IsPositive()
  amount: number;

  @IsPositive()
  gameId: number;
}
