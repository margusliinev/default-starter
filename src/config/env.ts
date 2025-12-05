import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, MinLength, validateSync } from 'class-validator';
import { Environment } from '../common/enums/environment';

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    @Min(0)
    @Max(65535)
    PORT: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    COOKIE_SECRET: string;

    @IsString()
    @IsNotEmpty()
    DB_HOST: string;

    @IsNumber()
    @Min(0)
    @Max(65535)
    DB_PORT: number;

    @IsString()
    @IsNotEmpty()
    DB_USER: string;

    @IsString()
    @IsNotEmpty()
    DB_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    DB_NAME: string;

    @IsString()
    @IsNotEmpty()
    CORS_ORIGIN: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        const message = Object.values(errors[0].constraints || {})[0];
        throw new Error(message);
    }

    return validatedConfig;
}

export const config = () => ({
    port: process.env.PORT as unknown as number,
    database: {
        port: process.env.DB_PORT as unknown as number,
        host: process.env.DB_HOST as string,
        username: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        database: process.env.DB_NAME as string,
    },
});
