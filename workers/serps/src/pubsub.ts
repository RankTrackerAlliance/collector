// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
//
import { KeywordRequest } from './handler'
import { handleFetchResponse } from './utils/handleFetchResponse'

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

  await Promise.all([
    // snsPromise,
    handleFetchResponse(
      fetch(
        `https://pubsub.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/topics/serps-completed:publish?${new URLSearchParams(
          {
            key: GCP_API_KEY,
          },
        )}`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                data: Buffer.from(stringifiedPayload).toString('base64'),
                messageId: bucketObjectKey,
              },
            ],
          }),
        },
      ),
      {
        errorMessage: 'GCP PubSub Error',
      },
    ),
  ])
}
