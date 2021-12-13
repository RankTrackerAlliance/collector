import { Keyword } from '../handler'
import { handleFetchResponse } from '../utils/handleFetchResponse'

type HtmlResponseSeoClarity = {
  data: {
    keyword: string
    size: number
    urlList: string[]
  }[]
}

export async function requestSerpSeoClarity(keyword: Keyword): Promise<string> {
  const data = await handleFetchResponse(
    fetch(
      `https://data.seoclarity.net/v1/google/live?${new URLSearchParams({
        market: `${keyword.country_code}-${keyword.language_code}`,
        query: keyword.phrase,
        device: keyword.device, // TODO: Convert our device to the API's supported mappings
      })}`,
      {
        method: 'post',
      },
    ),
    {
      errorMessage: `Failed to fetch SEO Clarity SERP for keyword ${keyword.phrase}`,
    },
  )

  return ''
}
