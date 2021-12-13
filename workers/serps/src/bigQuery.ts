import { KeywordRequest } from './handler'
import { handleFetchResponse } from './utils/handleFetchResponse'

const tableName = 'logs'

export async function pushToBigQuery(
  keywordRequest: KeywordRequest,
  bucketObjectKey: string,
  error: null | string,
  cfAsn?: number,
): Promise<void> {
  await handleFetchResponse(
    fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${GOOGLE_CLOUD_PROJECT}/datasets/serps/tables/${tableName}/insertAll?${new URLSearchParams(
        {
          key: GCP_API_KEY,
        },
      )}`,
      {
        method: 'post',
        headers: {
          type: 'application/json',
        },
        body: JSON.stringify({
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
        }),
      },
    ),
    {
      errorMessage: 'Failed to push to BigQuery',
    },
  )
}
