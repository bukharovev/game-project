import { MigrationInterface, QueryRunner } from "typeorm";

export class Initialization1695820482203 implements MigrationInterface {
    name = 'Initialization1695820482203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "games" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "started_at" TIMESTAMP NOT NULL, "scoring_started_at" TIMESTAMP, "ended_at" TIMESTAMP, "failed_at" TIMESTAMP, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bets" ("id" SERIAL NOT NULL, "wallet_id" character varying NOT NULL, "amount" integer NOT NULL, "status" character varying NOT NULL, "acceptance_time" TIMESTAMP, "game_id" integer NOT NULL, CONSTRAINT "PK_7ca91a6a39623bd5c21722bcedd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_results" ("id" SERIAL NOT NULL, "winner_wallet_id" character varying NOT NULL, "won_amount" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "game_id" integer NOT NULL, CONSTRAINT "PK_d45049161e874555e7cfe325afe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_5f2d39b49ade7e54364af8350e9" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_results" ADD CONSTRAINT "FK_f032def59471c31cd870d1fe1e9" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_results" DROP CONSTRAINT "FK_f032def59471c31cd870d1fe1e9"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_5f2d39b49ade7e54364af8350e9"`);
        await queryRunner.query(`DROP TABLE "game_results"`);
        await queryRunner.query(`DROP TABLE "bets"`);
        await queryRunner.query(`DROP TABLE "games"`);
    }

}
