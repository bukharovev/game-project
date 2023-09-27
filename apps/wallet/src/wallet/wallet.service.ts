import { Wallet } from './entities/wallet.entity';
import { DataSource, EntityManager } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import {
  IMakeTransactionResponse,
  SUCCESS,
  FAILURE,
} from '@libs/interfaces/make-transaction.interface';
import { assert } from '@libs/helpers/assert';
import { WalletNotFound } from './errors/wallet-not-found.error';
import { Injectable } from '@nestjs/common';
import { MakeTransactionDto } from './dto/make-transaction.dto';
import { SYSTEM_WALLET_ID } from './wallet.seed';
import { InsufficientFunds } from './errors/insufficient-funds.error';

@Injectable()
export class WalletService {
  constructor(private readonly dataSource: DataSource) {}

  async popUp(dto: MakeTransactionDto): Promise<IMakeTransactionResponse> {
    try {
      const { walletId, amount } = dto;
      await this.dataSource.transaction(
        async (entityManager: EntityManager) => {
          const wallet = await this.getWalletByIdAndLock(
            walletId,
            entityManager
          );
          assert(wallet, WalletNotFound);

          await entityManager
            .getRepository(Wallet)
            .createQueryBuilder('wallets')
            .update({
              balance: wallet.balance + amount,
            })
            .where('wallets.id = :walletId', { walletId })
            .execute();

          const txData = entityManager.getRepository(Transaction).create({
            from: SYSTEM_WALLET_ID,
            to: walletId,
            amount,
          });

          await entityManager.save(txData);
        }
      );

      return { status: SUCCESS };
    } catch (error) {
      console.dir({ 'WalletService::popUp': error }, { depth: null });
      return { status: FAILURE };
    }
  }

  async withdrawal(dto: MakeTransactionDto): Promise<IMakeTransactionResponse> {
    try {
      const { walletId, amount } = dto;
      await this.dataSource.transaction(
        async (entityManager: EntityManager) => {
          const wallet = await this.getWalletByIdAndLock(
            walletId,
            entityManager
          );
          assert(wallet, WalletNotFound);
          assert(wallet.balance >= amount, InsufficientFunds);

          await entityManager
            .getRepository(Wallet)
            .createQueryBuilder('wallets')
            .update({
              balance: wallet.balance - amount,
            })
            .where('wallets.id = :walletId', { walletId })
            .execute();

          const txData = entityManager.getRepository(Transaction).create({
            from: walletId,
            to: SYSTEM_WALLET_ID,
            amount,
          });

          await entityManager.save(txData);
        }
      );

      return { status: SUCCESS };
    } catch (error) {
      console.dir({ 'WalletService::withdrawal': error }, { depth: null });
      return { status: FAILURE };
    }
  }

  private async getWalletByIdAndLock(
    walletId: string,
    entityManager: EntityManager
  ) {
    return await entityManager
      .getRepository(Wallet)
      .createQueryBuilder('wallets')
      .setLock('pessimistic_write')
      .where('wallets.id = :walletId ', { walletId })
      .getOne();
  }
}
  