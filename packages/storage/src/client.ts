import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "config";

const s3 = new S3Client({
  endpoint: config.GARAGE_ENDPOINT,
  region: config.GARAGE_REGION,
  credentials: {
    accessKeyId: config.GARAGE_ACCESS_KEY,
    secretAccessKey: config.GARAGE_SECRET_KEY,
  },
  forcePathStyle: true,
});

const bucket = config.GARAGE_BUCKET;

export async function upload(key: string, body: Uint8Array, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function get(key: string) {
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!response.Body) {
    throw new Error(`Object body is empty for key: ${key}`);
  }
  return response.Body.transformToByteArray();
}
