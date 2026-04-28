export async function awaitIfServer<T>(promise: Promise<T>): Promise<T | undefined> {
  if (!import.meta.env.SSR) return undefined;
  return await promise;
}