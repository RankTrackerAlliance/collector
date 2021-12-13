import { handleRequest } from './handler'

export default {
  async fetch(request: Request): Promise<Response> {
    return handleRequest(request)
  },
}
