/** Presentation 層での入力バリデーション失敗を表すエラー */
export class ValidationError extends Error {
    constructor(public readonly details: string) {
        super(`Validation failed: ${details}`);
        this.name = 'ValidationError';
    }
}
