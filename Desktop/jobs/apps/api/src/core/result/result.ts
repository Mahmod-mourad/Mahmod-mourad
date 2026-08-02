/**
 * Result<T, E> — expected failures are values, not exceptions.
 *
 * Services return `Result<T, AppError>` and never throw for things we expect to
 * happen (not found, validation, external failure). The type system then forces
 * every caller to handle the error branch. `throw` is reserved for truly
 * unexpected, unrecoverable states.
 */
export type Result<T, E> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok;

/** Map the success value, leaving an error untouched. */
export const mapResult = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
  result.ok ? ok(fn(result.value)) : result;
