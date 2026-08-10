import { os } from '@orpc/server';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';


interface IORPCMetadata {
  anonymous?: boolean;
}

export const base = os
  .$meta<IORPCMetadata>({})
  .$context<{ headers: Headers } & ResponseHeadersPluginContext>();