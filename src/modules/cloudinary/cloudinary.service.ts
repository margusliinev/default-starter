import { Injectable, InternalServerErrorException } from '@nestjs/common';
import cloudinary from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadPhoto(file: Express.Multer.File): Promise<string> {
        const response = await cloudinary.v2.uploader.upload(file.path, { transformation: [{ width: 100, height: 100, crop: 'fit', quality: 'auto' }] });
        if (!response.secure_url) throw new InternalServerErrorException('Failed to upload photo');

        return response.secure_url;
    }
}
