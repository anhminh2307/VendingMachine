import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dvmbscqnq',
      api_key: '214355246456157',
      api_secret: 'nE28Z_igNhDIw0nEbJiDYMOEsRs',
    });
  },
};