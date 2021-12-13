// import brotli from 'brotli'
// import { compress } from 'wasm-brotli'
import * as brotli from 'brotli-wasm/pkg.bundler/brotli_wasm'
import { handleFetchResponse } from './utils/handleFetchResponse'

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
  console.log('Requesting backblaze auth...')

  const authKeyStr = `${BACKBLAZE_APP_ID}:${BACKBLAZE_APP_KEY}`
  console.log('authKeyStr', authKeyStr)

  const authKeys = btoa(authKeyStr)

  console.log('Accessing backblaze api...')

  return await handleFetchResponse<BackblazeAuthResponse>(
    fetch(`https://api.backblazeb2.com/b2api/v2/b2_authorize_account`, {
      headers: { Authorization: `Basic ${authKeys}` },
    }),
    {
      errorMessage: `Backblaze auth failed`,
    },
  )
}

export async function compressAndStoreHtml(
  html: string,
  bucketObjectKey: string,
): Promise<void> {
  // Compress html with brotli
  // const compressedHtml = brotli.compress(htmlBuffer, {
  //   quality: 11,
  //   mode: 1,
  // })
  console.log('Encoding html to bytes and compressing with brotli...')
  const compressedHtml = await brotli.compress(new TextEncoder().encode(html), {
    quality: 11,
  })

  // Generate upload url for backblaze

  const { apiUrl, authorizationToken } = await getBackblazeAuth()

  console.log('Requesting backblaze uploadUrl...')
  const { uploadUrl } = await handleFetchResponse<BackblazeGetUploadResponse>(
    fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'post',
      body: JSON.stringify({ bucketId: BACKBLAZE_BUCKET_ID }),
      headers: { Authorization: authorizationToken },
    }),
    { errorMessage: `Backblaze get upload url failed` },
  )

  console.log('Uploading to backblaze URL...')
  await handleFetchResponse(
    fetch(uploadUrl, {
      method: 'post',
      body: compressedHtml,
      headers: {
        'Content-Type': 'application/brotli',
        Authorization: authorizationToken,
        'X-Bz-File-Name': `${bucketObjectKey}`,
      },
    }),
    {
      errorMessage: `Backblaze upload failed`,
    },
  )

  console.log('Backblaze upload successful')
}

export async function checkHtmlStored(
  bucketObjectKey: string,
): Promise<boolean> {
  const { apiUrl, authorizationToken } = await getBackblazeAuth()

  console.log('Checking if html is stored...')
  const data = await handleFetchResponse<ListFilesResponse>(
    fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
      method: 'post',
      headers: { Authorization: authorizationToken },
      body: JSON.stringify({
        bucketId: BACKBLAZE_BUCKET_ID,
        startFileName: bucketObjectKey,
        maxFileCount: 1,
      }),
    }),
    {
      errorMessage: `Backblaze list file names failed`,
    },
  )

  if (data.files?.[0]?.fileName === bucketObjectKey) {
    console.log('HTML is already stored')
    return true
  }

  console.log('HTML has not been stored yet')
  return false
}
