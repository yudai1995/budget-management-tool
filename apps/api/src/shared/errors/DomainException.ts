/** ドメイン例外の基底クラス。HTTP ステータスコードと機械可読なコードを保持する */
export class DomainException extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = 'DomainException';
    }
}

/** 認証失敗（パスワード不一致） */
export class AuthenticationError extends DomainException {
    constructor(message = '認証に失敗しました') {
        super('AUTHENTICATION_FAILED', message, 401);
    }
}

/** リソースが存在しない */
export class NotFoundError extends DomainException {
    constructor(message = 'リソースが見つかりません') {
        super('NOT_FOUND', message, 404);
    }
}

/** 入力バリデーション失敗 */
export class ValidationError extends DomainException {
    constructor(
        message: string,
        public readonly details?: string
    ) {
        super('VALIDATION_ERROR', message, 400);
    }
}
