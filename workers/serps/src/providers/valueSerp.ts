import axios from 'axios'
import { Keyword } from '../handler'

type ValueSerpParams = {
  api_key: string
  q: string
  page: '1'
  num: '100'
  device: 'desktop' | 'mobile'
  output: 'html' | 'json'
  mobile_type?: 'android' | 'iphone'
  location: 'United+States'
}

export async function requestSerpValueSerp(keyword: Keyword): Promise<string> {
  // set up the request parameters
  const params: ValueSerpParams = {
    api_key: process.env.VALUESERP_API_KEY as string,
    q: keyword.phrase,
    page: '1',
    num: '100',
    output: 'html',
    location: 'United+States',
    ...(keyword.device === 'desktop'
      ? {
          device: 'desktop',
        }
      : {
          device: 'mobile',
          mobile_type: keyword.device,
        }),
  }

  // make the http GET request to VALUE SERP
  const { data } = await axios.get('https://api.valueserp.com/search', {
    params,
  })

  return data
}
