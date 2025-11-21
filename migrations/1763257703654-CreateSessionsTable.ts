import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1763257703654 implements MigrationInterface {
    public async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" UUID NOT NULL DEFAULT gen_random_uuid(),
                "user_id" UUID NOT NULL,
                "expires_at" TIMESTAMPTZ NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_sessions_expires_at" ON "sessions" ("expires_at");
        `);
    }

    public async down(queryRunner: QueryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sessions_expires_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sessions_user_id"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
    }
}
