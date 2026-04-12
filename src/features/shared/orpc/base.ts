import { os } from '@orpc/server';


interface IORPCMetadata {
  anonymous?: boolean;
}

export const base = os
  .$meta<IORPCMetadata>({})
  .$context<{ headers: Headers }>();