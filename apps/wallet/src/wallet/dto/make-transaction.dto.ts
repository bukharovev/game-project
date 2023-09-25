import { IMakeTransaction } from '@libs/interfaces/make-transaction.interface';
import { IsPositive, IsUUID } from 'class-validator';

export class MakeTransactionDto implements IMakeTransaction {
  @IsUUID()
  walletId: string;

  @IsPositive()
  amount: number;
}
