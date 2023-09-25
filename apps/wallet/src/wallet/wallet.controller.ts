import { Body, Controller, Post } from "@nestjs/common";
import { MakeTransactionDto } from './dto/make-transaction.dto';
import { WalletService } from './wallet.service';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('pop-up')
  popUp(@Body() makeTransactionDto: MakeTransactionDto) {
    return this.walletService.popUp(makeTransactionDto);
  }

  @Post('withdrawal')
  withdrawal(@Body() makeTransactionDto: MakeTransactionDto) {
    return this.walletService.withdrawal(makeTransactionDto);
  }
}