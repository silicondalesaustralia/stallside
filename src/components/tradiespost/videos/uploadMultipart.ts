const PARALLEL_PARTS = 4
const PART_ATTEMPTS = 3

function putPart(url: string, blob: Blob, onLoaded: (bytes: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (event) => onLoaded(event.loaded)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`part upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('part upload failed (network)'))
    xhr.open('PUT', url)
    xhr.send(blob)
  })
}

async function putPartWithRetry(url: string, blob: Blob, onLoaded: (bytes: number) => void): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await putPart(url, blob, onLoaded)
      onLoaded(blob.size)
      return
    } catch (err) {
      onLoaded(0)
      if (attempt >= PART_ATTEMPTS) throw err
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

/** Uploads `file` in fixed-size parts, several at once, retrying each failed part. */
export async function uploadFileInParts(input: {
  file: File
  partSize: number
  partUrls: string[]
  onProgress: (percent: number) => void
}): Promise<void> {
  const { file, partSize, partUrls } = input
  const loaded = new Array<number>(partUrls.length).fill(0)
  let lastPercent = -1
  const report = () => {
    const sent = loaded.reduce((sum, n) => sum + n, 0)
    const percent = Math.min(100, Math.floor((sent / file.size) * 100))
    if (percent !== lastPercent) {
      lastPercent = percent
      input.onProgress(percent)
    }
  }

  let next = 0
  const runLane = async () => {
    while (next < partUrls.length) {
      const index = next++
      const blob = file.slice(index * partSize, Math.min(file.size, (index + 1) * partSize))
      await putPartWithRetry(partUrls[index], blob, (bytes) => {
        loaded[index] = bytes
        report()
      })
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLEL_PARTS, partUrls.length) }, runLane))
}
