import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";

export const streamUpload = (req: any) => {
  return new Promise(async (resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      (error: any, result: any) => {
        if (result) {
          return resolve(result);
        } else {
          return reject(error);
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};
