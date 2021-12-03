import axios from 'axios'
import { KeywordRequest } from './handler'

export async function pushToBigQuery(
  keywordRequest: KeywordRequest,
  bucketObjectKey: string,
  error: null | string,
  cfAsn?: string,
): Promise<void> {
  await axios.post(
    `https://bigquery.googleapis.com/bigquery/v2/projects/${process.env.GOOGLE_CLOUD_PROJECT}/datasets/serps/tables//insertAll`,
    {
      rows: [
        {
          insertId: cfAsn,
          json: {
            keyword_id: keywordRequest.keyword.keyword_id,
            date: keywordRequest.date,
            serp_provider: keywordRequest.serpProvider,
            bucket_object_key: bucketObjectKey,
            error,
          },
        },
      ],
    },
  )
}
