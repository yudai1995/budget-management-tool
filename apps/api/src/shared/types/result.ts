import type { DomainException } from '../errors/DomainException';

/**
 * 成功・失敗を型で表現する Result 型。
 * ユースケースが例外を throw せずに呼び出し側へエラーを伝える際に使用する。
 */
export type Result<T, E extends DomainException = DomainException> = { ok: true; value: T } | { ok: false; error: E };

/** 成功値をラップして Result を返すヘルパー */
export function ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

/** エラーをラップして Result を返すヘルパー */
export function err<E extends DomainException>(error: E): Result<never, E> {
    return { ok: false, error };
}
