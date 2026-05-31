export interface IXhrUploadOptions {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
  headers?: Record<string, string>;
  method?: 'POST' | 'PUT' | 'PATCH';
}

export async function xhrUpload<T = unknown>(
  url: string,
  body: FormData | Blob,
  { signal, onProgress, headers, method = 'POST' }: IXhrUploadOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = 'text';

    if (headers) {
      for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    }

    let onAbort: (() => void) | undefined;
    const cleanup = () => {
      if (signal && onAbort) signal.removeEventListener('abort', onAbort);
    };

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener('load', () => {
      cleanup();
      onProgress?.(100);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = xhr.responseText ? (JSON.parse(xhr.responseText) as T) : (undefined as T);
          resolve(data);
        } catch {
          reject(new Error('Invalid JSON response.'));
        }
        return;
      }

      let message = `Upload failed (${xhr.status}).`;
      try {
        const parsed = JSON.parse(xhr.responseText) as { message?: string };
        if (parsed?.message) message = parsed.message;
      } catch {
        // not JSON — keep default message
      }
      reject(new Error(message));
    });

    xhr.addEventListener('error', () => {
      cleanup();
      reject(new Error('Network error.'));
    });

    xhr.addEventListener('abort', () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    });

    if (signal) {
      onAbort = () => xhr.abort();
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.send(body);
  });
}