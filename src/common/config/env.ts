import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, MinLength, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { Environment } from '../../common/enums/environment';

class EnvironmentVariables {
    @IsNumber()
    @Min(0)
    @Max(65535)
    PORT: number;

    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsString()
    @IsNotEmpty()
    FRONTEND_URL: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    COOKIE_SECRET: string;

    @IsNumber()
    @Min(0)
    @Max(65535)
    @Transform(({ value }) => Number(value))
    DB_PORT: number;

    @IsString()
    @IsNotEmpty()
    DB_HOST: string;

    @IsString()
    @IsNotEmpty()
    DB_NAME: string;

    @IsString()
    @IsNotEmpty()
    DB_USERNAME: string;

    @IsString()
    @IsNotEmpty()
    DB_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    GOOGLE_CLIENT_ID: string;

    @IsString()
    @IsNotEmpty()
    GOOGLE_CLIENT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    GOOGLE_CALLBACK_URL: string;

    @IsString()
    @IsNotEmpty()
    GITHUB_CLIENT_ID: string;

    @IsString()
    @IsNotEmpty()
    GITHUB_CLIENT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    GITHUB_CALLBACK_URL: string;
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
    nodeEnv: process.env.NODE_ENV as Environment,
    frontendUrl: process.env.FRONTEND_URL as string,
    cookieSecret: process.env.COOKIE_SECRET as string,
    database: {
        port: process.env.DB_PORT as unknown as number,
        host: process.env.DB_HOST as string,
        name: process.env.DB_NAME as string,
        username: process.env.DB_USERNAME as string,
        password: process.env.DB_PASSWORD as string,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL as string,
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackUrl: process.env.GITHUB_CALLBACK_URL as string,
    },
});
