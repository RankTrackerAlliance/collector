import { Keyword } from '../handler'
import { handleFetchResponse } from '../utils/handleFetchResponse'

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
  console.log('Requesting serp from valueSerp...')
  // set up the request parameters
  const searchParams: ValueSerpParams = {
    api_key: VALUESERP_API_KEY as string,
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
  const data = await handleFetchResponse<string>(
    fetch(
      `https://api.valueserp.com/search?${new URLSearchParams(searchParams)}`,
    ),
    {
      text: true,
      errorMessage: `Error fetching serp from valueSerp for keyword ${keyword.phrase}`,
    },
  )

  console.log('Successfully requested serp from valueSerp.', data.slice(0, 100))

  return data
}
