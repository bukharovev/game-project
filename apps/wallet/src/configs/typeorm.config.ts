import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeormNamingStrategy } from '@libs/helpers/typeorm-naming.strategy';

export const getTypeOrmConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => {
  const developmentOptions =
    configService.get<string>('NODE_ENV') === 'development'
      ? ({
          logger: 'advanced-console',
          logging: 'all',
        } as const)
      : {};

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    autoLoadEntities: true,
    namingStrategy: new TypeormNamingStrategy(),
    ...developmentOptions,
  };
};
