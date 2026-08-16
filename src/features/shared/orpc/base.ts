import { os } from '@orpc/server';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { LoggerContext } from '@orpc/experimental-pino';


interface IORPCMetadata {
  anonymous?: boolean;
}

export const base = os
  .$meta<IORPCMetadata>({})
  .$context<{ headers: Headers } & ResponseHeadersPluginContext & LoggerContext>();