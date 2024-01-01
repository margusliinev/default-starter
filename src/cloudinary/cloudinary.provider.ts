import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
    provide: 'Cloudinary',
    inject: [ConfigService],
    useFactory: (configService: ConfigService): void => {
        const API_KEY = configService.get<string>('CLOUD_API_KEY');
        const API_SECRET = configService.get<string>('CLOUD_API_SECRET');
        const CLOUD_NAME = configService.get<string>('CLOUD_NAME');

        v2.config({ api_secret: API_SECRET, api_key: API_KEY, cloud_name: CLOUD_NAME });
    },
};
