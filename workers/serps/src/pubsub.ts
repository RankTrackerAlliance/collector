// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import axios from 'axios'
//
import { KeywordRequest } from './handler'

// Create SNS service object.
// const snsClient = new SNSClient({ region: 'us-east-1' })
// const snsTopicArn = 'asdfasildf0asdfs-dfasd-fa-sd-asdf' // TODO: Get an actual topic ARN

// Instantiates a new GCP PubSub client

export async function notifyPubSub(
  keywordRequest: KeywordRequest,
  bucketObjectKey: string,
): Promise<void> {
  const payload = {
    keywordRequest: keywordRequest,
    bucketObjectKey,
  }

  const stringifiedPayload = JSON.stringify(payload)

  // // Notfify AWS SNS
  // const snsPromise = snsClient.send(
  //   new PublishCommand({
  //     TopicArn: snsTopicArn,
  //     Message: stringifiedPayload,
  //     MessageDeduplicationId: bucketObjectKey,
  //   }),
  // )

  // Notify GCP PubSub

  const gcpPromise = axios.post(
    `https://pubsub.googleapis.com/v1/projects/${process.env.GOOGLE_CLOUD_PROJECT}/topics/serps-completed:publish`,
    {
      messages: [
        {
          data: Buffer.from(stringifiedPayload).toString('base64'),
          messageId: bucketObjectKey,
        },
      ],
    },
    {
      params: {
        key: process.env.GCP_API_KEY,
      },
    },
  )

  await Promise.all([
    // snsPromise,
    gcpPromise,
  ])
}
