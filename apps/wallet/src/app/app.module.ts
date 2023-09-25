import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '@wallet/src/configs/typeorm.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    WalletModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
