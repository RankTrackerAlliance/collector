import { BigQuery } from '@google-cloud/bigquery'
//
import { KeywordRequest } from './handler'

const client = new BigQuery({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  },
})

export async function pushToBigQuery(
  keywordRequest: KeywordRequest,
  bucketObjectKey: string,
  error: null | string,
): Promise<void> {
  await client
    .dataset('dataset-id')
    .table('table-id')
    .insert([
      {
        keyword_id: keywordRequest.keyword.keyword_id,
        date: keywordRequest.date,
        serp_provider: keywordRequest.serpProvider,
        bucket_object_key: bucketObjectKey,
        error,
      },
    ])
}
