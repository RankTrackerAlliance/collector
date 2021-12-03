import { pushToBigQuery } from './bigQuery'
import { requestSerpSeoClarity } from './providers/seoClarity'
import { requestSerpValueSerp } from './providers/valueSerp'
import { notifyPubSub } from './pubsub'
import { checkHtmlStored, compressAndStoreHtml } from './storage'

export type KeywordRequest = {
  keyword: Keyword
  serpProvider: SerpProvider
  date: string
}

type SerpProvider = 'seoclarity' | 'valueserp'

export type Keyword = {
  keyword_id: string
  phrase: string
  device: KeywordDevice
  engine: KeywordEngine
  language_code: string
  language: string
  country_code: string
  country: string
  ad_words_criteria_id: number
  location: string
  location_type: string
  tags?: string[]
  revision_date?: string
}

type KeywordDevice = 'desktop' | 'iphone' | 'android'
type KeywordEngine = 'google'

export async function handleRequest(request: Request): Promise<Response> {
  const cfAsn = request.cf?.asn

  const keywordRequest = await request.json<KeywordRequest>()
  const bucketObjectKey = [
    keywordRequest.date,
    keywordRequest.keyword.keyword_id,
  ].join('_')

  let preBqError: unknown

  try {
    // Check for SERP existence
    const exists = await checkHtmlStored(bucketObjectKey)

    if (!exists) {
      // Request SERP
      let serpHtml = await requestSerp(keywordRequest)

      // Validate SERP
      await validateHtml(serpHtml)

      // Mutate SERP
      serpHtml = await mutateHtml(serpHtml)

      // Compress and Store SERP
      await compressAndStoreHtml(serpHtml, bucketObjectKey)
    }

    // New SERP notification - AWS SNS / GCP PubSub
    await notifyPubSub(keywordRequest, bucketObjectKey)
  } catch (err) {
    preBqError = err
  }

  try {
    // Push result to BigQuery
    await pushToBigQuery(
      keywordRequest,
      bucketObjectKey,
      preBqError ? JSON.stringify(preBqError) : null,
      cfAsn,
    )

    if (preBqError) {
      throw preBqError
    }

    return new Response(undefined, { status: 204 })
  } catch (err) {
    return new Response(JSON.stringify(err, null, 2), {
      status: 500,
    })
  }
}

async function requestSerp(keywordRequest: KeywordRequest): Promise<string> {
  if (keywordRequest.serpProvider === 'seoclarity') {
    return requestSerpSeoClarity(keywordRequest.keyword)
  }
  if (keywordRequest.serpProvider === 'valueserp') {
    return requestSerpValueSerp(keywordRequest.keyword)
  }

  throw new Error('Unsupported serp provider')
}

// Validate a SERP object to ensure it is valid
async function validateHtml(html: string): Promise<void> {
  if (html.length < 100) {
    throw new Error(`Invalid SERP: Serp is less than 100 characters`)
  }
}

async function mutateHtml(html: string): Promise<string> {
  // Replace images with base64, etc?
  return html
}
