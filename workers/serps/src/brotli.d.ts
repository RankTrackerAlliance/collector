declare module 'brotli' {
  interface BrotliDecompressOptions {
    chunkSize?: number
  }

  export function compress(buffer: any, options: any): void
  export function decompress(options: BrotliDecompressOptions): void
}
