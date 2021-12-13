export async function handleFetchResponse<T>(
  promise: Promise<Response>,
  opts: { errorMessage: string; text?: boolean },
): Promise<T> {
  const res = await promise
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      `Error ${res.status} - ${opts.errorMessage}\n\nBody: ${JSON.stringify(
        await res.json(),
        null,
        2,
      )}`,
    )
  }

  if (opts.text) {
    return (await res.text()) as unknown as T
  }

  return await res.json<T>()
}
