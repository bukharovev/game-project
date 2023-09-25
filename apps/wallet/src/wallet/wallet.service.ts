import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { IMakeTransaction, IMakeTransactionResponse, SUCCESS, FAILURE } from '@libs/interfaces/make-transaction.interface';
import { assert } from '@libs/helpers/assert';
import { WalletNotFound } from './errors/wallet-not-found.error';
import { Logger } from '@nestjs/common';
import { MakeTransactionDto } from './dto/make-transaction.dto';

const SYSTEM_WALLET_ID = 'eef09c32-5095-43bb-b6ff-d138ee5a3770';

export class WalletService {
  constructor(
    // @InjectRepository(Wallet)
    // private readonly walletsRepository: Repository<Wallet>,
    // @InjectRepository(Transaction)
    // private readonly transactionsRepository: Repository<Transaction>,
    private readonly dataSource: DataSource
  ) {}

  async popUp(dto: MakeTransactionDto): Promise<IMakeTransactionResponse> {
    const { walletId, amount } = dto;
    // const wallet = await this.walletsRepository.findOneBy({ id: walletId });
    // assert(wallet, WalletNotFound);

    try {
      await this.dataSource.transaction(
        async (entityManager: EntityManager) => {
          const wallet = await entityManager
            .getRepository(Wallet)
            .createQueryBuilder('wallets')
            .setLock('pessimistic_write')
            .where('wallets.id = :walletId ', { walletId })
            .getOne()

          assert(wallet, WalletNotFound);

          await entityManager
            .getRepository(Wallet)
            .createQueryBuilder('wallets')
            .update({
              balance: wallet.balance + amount,
            })
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
      Logger.error(`WalletService::popUp::${error}`);
      return { status: FAILURE };
    }
  }

  async withdrawal(dto: MakeTransactionDto): Promise<IMakeTransactionResponse> {
    const { walletId, amount } = dto;
    // const wallet = await this.walletsRepository.findOneBy({ id: walletId });
    // assert(wallet, WalletNotFound);

    try {
      await this.dataSource.transaction(
        async (entityManager: EntityManager) => {
          const wallet = await entityManager
            .getRepository(Wallet)
            .createQueryBuilder('wallets')
            .setLock('pessimistic_write')
            .where('wallets.id = :walletId ', { walletId })
            .getOne()

          assert(wallet, WalletNotFound);

          await entityManager
            .getRepository(Wallet)
            .createQueryBuilder('wallets')
            .update({
              balance: wallet.balance - amount,
            })
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
      Logger.error(`WalletService::withdrawal::${error}`);
      return { status: FAILURE };
    }
  }
}
