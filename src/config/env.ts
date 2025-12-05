import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl, Max, Min, MinLength, validateSync } from 'class-validator';
import { Environment } from '../common/enums/environment';

class EnvironmentVariables {
    @IsNumber()
    @Min(0)
    @Max(65535)
    PORT: number;

    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsString()
    @IsNotEmpty()
    CORS_ORIGIN: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    COOKIE_SECRET: string;

    @IsUrl()
    @IsString()
    @IsNotEmpty()
    DATABASE_URL: string;
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
    corsOrigin: process.env.CORS_ORIGIN as string,
    cookieSecret: process.env.COOKIE_SECRET as string,
    database: { url: process.env.DATABASE_URL as string },
});
