// Load the SDK and UUID
import AWS, { AWSError } from 'aws-sdk'
import brotli from 'brotli'

// Create an S3 client
const credentials = new AWS.SharedIniFileCredentials({ profile: 'b2' })
AWS.config.credentials = credentials
const ep = new AWS.Endpoint(
  // 's3.us-west-002.backblazeb2.com'
  process.env.BACKBLAZE_B2_S3_ENDPOINT as string,
)
const s3 = new AWS.S3({ endpoint: ep })

// Create a bucket and upload something into it
const bucketName = 'serps'

export async function compressAndStoreHtml(
  html: string,
  bucketObjectKey: string,
): Promise<void> {
  // convert html from string into a buffer
  const htmlBuffer = Buffer.from(html, 'utf8')

  // Compress html with brotli
  const compressedHtml = await brotli.compress(htmlBuffer, {
    mode: 1,
    quality: 11,
  })

  // Store the html
  await s3
    .putObject({
      Bucket: bucketName,
      Key: bucketObjectKey,
      Body: compressedHtml,
    })
    .promise()
}

export async function checkHtmlStored(
  bucketObjectKey: string,
): Promise<boolean> {
  try {
    await s3
      .headObject({
        Bucket: bucketName,
        Key: bucketObjectKey,
      })
      .promise()
  } catch (err: unknown) {
    if ((err as AWSError | undefined)?.code === 'NotFound') {
      return false
    }

    throw err
  }

  return true
}
