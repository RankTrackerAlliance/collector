import axios from 'axios'
import { Keyword } from '../handler'

type HtmlResponseSeoClarity = {
  data: {
    keyword: string
    size: number
    urlList: string[]
  }[]
}

export async function requestSerpSeoClarity(keyword: Keyword): Promise<string> {
  const { data } = await axios.post<HtmlResponseSeoClarity>(
    `https://data.seoclarity.net/v1/google/live`,
    {
      params: {
        market: `${keyword.country_code}-${keyword.language_code}`,
        query: keyword.phrase,
        device: keyword.device, // TODO: Convert our device to the API's supported mappings
      },
    },
  )

  return ''
}
