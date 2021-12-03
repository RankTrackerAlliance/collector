// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { PubSub } from '@google-cloud/pubsub'
//
import { KeywordRequest } from './handler'

// Create SNS service object.
// const snsClient = new SNSClient({ region: 'us-east-1' })
// const snsTopicArn = 'asdfasildf0asdfs-dfasd-fa-sd-asdf' // TODO: Get an actual topic ARN

// Instantiates a new GCP PubSub client
const pubsub = new PubSub({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  },
})
const topic = pubsub.topic('serps-completed')

export async function notifyPubSub(
  keywordRequest: KeywordRequest,
  bucketObjectKey: string,
): Promise<void> {
  const payload = {
    keywordRequest: keywordRequest,
    bucketObjectKey,
  }

  // // Notfify AWS SNS
  // const snsPromise = snsClient.send(
  //   new PublishCommand({
  //     TopicArn: snsTopicArn,
  //     Message: JSON.stringify(payload),
  //     MessageDeduplicationId: bucketObjectKey,
  //   }),
  // )

  // Notify GCP PubSub
  const gcpPromise = topic.publishMessage({
    json: payload,
    messageId: bucketObjectKey,
  })

  await Promise.all([
    // snsPromise,
    gcpPromise,
  ])
}
