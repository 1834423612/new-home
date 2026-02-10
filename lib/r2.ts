import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 environment variables are not set")
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

export async function listR2Objects(prefix = "", maxKeys = 100) {
  const client = getR2Client()
  const bucket = process.env.R2_BUCKET_NAME!

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: maxKeys,
  })

  const response = await client.send(command)

  return (response.Contents || []).map((obj) => ({
    key: obj.Key || "",
    size: obj.Size || 0,
    lastModified: obj.LastModified?.toISOString() || "",
    url: `${process.env.R2_PUBLIC_URL}/${obj.Key}`,
  }))
}

export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string) {
  const client = getR2Client()
  const bucket = process.env.R2_BUCKET_NAME!

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await client.send(command)
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export async function deleteFromR2(key: string) {
  const client = getR2Client()
  const bucket = process.env.R2_BUCKET_NAME!

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  await client.send(command)
}
