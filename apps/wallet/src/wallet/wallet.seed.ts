import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Wallet } from './entities/wallet.entity';

export const SYSTEM_WALLET_ID = 'eef09c32-5095-43bb-b6ff-d138ee5a3770';

export class WalletSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Wallet);
    const wallets: Array<Wallet> = [
      {
        id: SYSTEM_WALLET_ID,
        balance: 10_000_000,
        createdAt: new Date('2023-09-20T14:13:15.838Z'),
        updatedAt: new Date('2023-09-20T14:13:15.838Z'),
      },
      {
        id: '659de711-22f2-451a-a81f-e86e0c428812',
        balance: 1000,
        createdAt: new Date('2023-09-21T14:13:15.838Z'),
        updatedAt: new Date('2023-09-21T14:13:15.838Z'),
      },
      {
        id: 'a8533c47-3463-47ce-9221-edcc907822e9',
        balance: 1000,
        createdAt: new Date('2023-09-22T14:13:15.838Z'),
        updatedAt: new Date('2023-09-22T14:13:15.838Z'),
      },
      {
        id: 'c51524f3-cd57-46d1-b266-16f816da055b',
        balance: 1000,
        createdAt: new Date('2023-09-23T14:13:15.838Z'),
        updatedAt: new Date('2023-09-23T14:13:15.838Z'),
      },
      {
        id: 'f4a7b1b6-22e4-401b-ba8d-05bdf211bda1',
        balance: 1000,
        createdAt: new Date('2023-09-24T14:13:15.838Z'),
        updatedAt: new Date('2023-09-24T14:13:15.838Z'),
      },
      {
        id: 'ef184bb4-77c4-4bdc-8c75-9f4288b4d954',
        balance: 1000,
        createdAt: new Date('2023-09-25T14:13:15.838Z'),
        updatedAt: new Date('2023-09-25T14:13:15.838Z'),
      },
    ];

    for (const wallet of wallets) {
      await repository.insert(wallet);
    }
  }
}
