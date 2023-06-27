import { backOff } from 'exponential-backoff';
import { type CallReturn, TypicalHttpError } from 'typical-fetch';

export async function performRequest<R, E>(
  call: () => Promise<CallReturn<R, E>>,
): Promise<R> {
  const requestCall = async () => {
    const res = await call();

    if (res.success) {
      return res.body;
    }

    throw res.error;
  };

  return backOff(() => requestCall(), {
    retry: error => {
      if (error instanceof TypicalHttpError && error.status === 429) {
        return true;
      }
      return false;
    },
  });
}
