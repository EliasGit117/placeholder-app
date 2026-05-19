import { UTApi } from 'uploadthing/server';
import { serverEnvConfig } from '@/lib/config/server-env-config';

export interface UploadOptions {
  acl?: 'public-read' | 'private';
  contentDisposition?: 'inline' | 'attachment';
}

export interface UploadResult {
  key: string;
  url: string;
  name: string;
  size: number;
}

export interface FileInfo {
  id: string;
  key: string;
  name: string;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
}

export interface IS3Storage {
  upload(file: File, opts?: UploadOptions): Promise<UploadResult>;
  delete(keys: string | string[]): Promise<void>;
  list(opts?: ListOptions): Promise<FileInfo[]>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  rename(key: string, newName: string): Promise<void>;
  updateVisibility(keys: string | string[], acl: 'public-read' | 'private'): Promise<void>;
}

export class S3Storage implements IS3Storage {
  private readonly api: UTApi;

  constructor(api?: UTApi) {
    this.api = api ?? new UTApi({ token: serverEnvConfig.uploadthingToken });
  }

  async upload(file: File, opts?: UploadOptions): Promise<UploadResult> {
    const result = await this.api.uploadFiles(file, {
      acl: opts?.acl,
      contentDisposition: opts?.contentDisposition,
    });

    if (result.error)
      throw new Error(result.error.message);

    return {
      key: result.data.key,
      url: result.data.ufsUrl,
      name: result.data.name,
      size: result.data.size,
    };
  }

  async delete(keys: string | string[]): Promise<void> {
    await this.api.deleteFiles(Array.isArray(keys) ? keys : [keys]);
  }

  async list(opts?: ListOptions): Promise<FileInfo[]> {
    const res = await this.api.listFiles({ limit: opts?.limit, offset: opts?.offset });
    return res.files.map(f => ({ id: f.id, key: f.key, name: f.name }));
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    const res = await this.api.generateSignedURL(key, expiresIn ? { expiresIn } : undefined);
    return res.ufsUrl;
  }

  async rename(key: string, newName: string): Promise<void> {
    await this.api.renameFiles({ fileKey: key, newName });
  }

  async updateVisibility(keys: string | string[], acl: 'public-read' | 'private'): Promise<void> {
    await this.api.updateACL(Array.isArray(keys) ? keys : [keys], acl);
  }
}

export const s3Storage = new S3Storage();
