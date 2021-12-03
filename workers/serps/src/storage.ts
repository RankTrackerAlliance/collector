import axios from 'axios'
import brotli from 'brotli'

type BackblazeAuthResponse = {
  absoluteMinimumPartSize: number
  accountId: string
  allowed: {
    bucketId: string
    bucketName: string
    capabilities?: string[] | null
    namePrefix?: null
  }
  apiUrl: string
  authorizationToken: string
  downloadUrl: string
  recommendedPartSize: number
}

type BackblazeGetUploadResponse = {
  authorizationToken: string
  bucketId: string
  uploadUrl: string
}

type ListFilesResponse = {
  files?: FilesEntity[] | null
  nextFileName?: null
}
type FilesEntity = {
  accountId: string
  action: string
  bucketId: string
  contentLength: number
  contentSha1: string
  contentType: string
  fileId: string
  fileName: string
  uploadTimestamp: number
  // fileInfo: FileInfo;
  // fileRetention: FileRetention;
  // legalHold: LegalHold;
  // serverSideEncryption: ServerSideEncryption;
}

async function getBackblazeAuth() {
  const authKeys = Buffer.from(
    `${process.env.BACKBLAZE_APP_ID}:${process.env.BACKBLAZE_APP_KEY}`,
  ).toString('base64')

  const { data } = await axios.get<BackblazeAuthResponse>(
    `https://api.backblazeb2.com/b2api/v2/b2_authorize_account`,
    { headers: { Authorization: `Basic ${authKeys}` } },
  )

  return data
}

export async function compressAndStoreHtml(
  html: string,
  bucketObjectKey: string,
): Promise<void> {
  // convert html from string into a buffer
  const htmlBuffer = Buffer.from(html, 'utf8')

  // Compress html with brotli
  const compressedHtml = brotli.compress(htmlBuffer, {
    mode: 1,
    quality: 11,
  })

  // Generate upload url for backblaze

  const { apiUrl, authorizationToken } = await getBackblazeAuth()

  const {
    data: { uploadUrl },
  } = await axios.post<BackblazeGetUploadResponse>(
    `${apiUrl}/b2api/v2/b2_get_upload_url`,
    { bucketId: process.env.BACKBLAZE_BUCKET_ID },
    { headers: { Authorization: authorizationToken } },
  )

  await axios.post(uploadUrl, compressedHtml, {
    headers: {
      Authorization: authorizationToken,
      'Content-Type': 'text/html',
      'X-Bz-File-Name': `${bucketObjectKey}`,
    },
  })
}

export async function checkHtmlStored(
  bucketObjectKey: string,
): Promise<boolean> {
  const { apiUrl, authorizationToken } = await getBackblazeAuth()

  const { data } = await axios.post<ListFilesResponse>(
    `${apiUrl}/b2api/v2/b2_list_file_names`,
    {
      bucketId: process.env.BACKBLAZE_BUCKET_ID,
      startFileName: bucketObjectKey,
      maxFileCount: 1,
    },
    {
      headers: { Authorization: authorizationToken },
    },
  )

  if (data.files?.[0]?.fileName === bucketObjectKey) {
    return true
  }

  return false
}
