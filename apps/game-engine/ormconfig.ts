import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { TypeormNamingStrategy } from '../../libs/helpers/typeorm-naming.strategy';

const getEnvironmentVariable = (variableName: string) => {
  return process.env[variableName];
};

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: getEnvironmentVariable('DB_HOST'),
  port: Number(getEnvironmentVariable('DB_PORT')),
  username: getEnvironmentVariable('DB_USERNAME'),
  password: getEnvironmentVariable('DB_PASSWORD'),
  database: getEnvironmentVariable('DB_NAME'),
  entities: ['apps/game-engine/src/**/*.entity.ts'],
  namingStrategy: new TypeormNamingStrategy(),
  migrationsTableName: 'typeorm_migrations',
  migrations: ['apps/game-engine/src/migrations/*.{ts,js}'],
};

export const connectionSource: DataSource = new DataSource(options);
