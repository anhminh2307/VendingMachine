import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        
        // Fix lỗi: Kiểm tra nếu result tồn tại thì mới resolve
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload result is undefined'));
        }
      });

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}