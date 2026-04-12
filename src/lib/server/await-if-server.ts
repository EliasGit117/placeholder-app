
export async function awaitIfServer(promise: Promise<unknown>): Promise<void> {
  if (typeof window !== 'undefined')
    return;

  await promise;
}