import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1763252052790 implements MigrationInterface {
    name = 'CreateUsersTable1763252052790';

    public async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID NOT NULL DEFAULT gen_random_uuid(),
                "username" VARCHAR(50) NOT NULL,
                "email" VARCHAR(255) NOT NULL,
                "password" VARCHAR(255) NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMPTZ,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
