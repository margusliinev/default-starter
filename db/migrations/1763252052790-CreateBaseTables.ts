import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBaseTables1763252052790 implements MigrationInterface {
    name = 'CreateBaseTables1763252052790';

    public async up(queryRunner: QueryRunner) {
        await queryRunner.query(`CREATE TYPE "provider_type" AS ENUM ('password', 'google', 'github')`);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID NOT NULL DEFAULT uuidv7(),
                "name" VARCHAR(255) NOT NULL,
                "email" VARCHAR(255) NOT NULL,
                "email_verified_at" TIMESTAMPTZ,
                "image" TEXT,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_users_email" UNIQUE ("email")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "accounts" (
                "id" UUID NOT NULL DEFAULT uuidv7(),
                "user_id" UUID NOT NULL,
                "provider" "provider_type" NOT NULL,
                "provider_id" VARCHAR(255),
                "password" VARCHAR(255),
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_accounts_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "UQ_accounts_user_provider" UNIQUE ("user_id", "provider")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" UUID NOT NULL DEFAULT uuidv7(),
                "user_id" UUID NOT NULL,
                "token" TEXT NOT NULL,
                "expires_at" TIMESTAMPTZ NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "UQ_sessions_token" UNIQUE ("token")
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_expires_at" ON "sessions" ("expires_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_accounts_provider_provider_id" ON "accounts" ("provider", "provider_id")`);
    }

    public async down(queryRunner: QueryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_accounts_provider_provider_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sessions_expires_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sessions_user_id"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "sessions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "accounts"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

        await queryRunner.query(`DROP TYPE IF EXISTS "provider_type"`);
    }
}
