import type { SecurityQuestionPreset } from '@budget/common';

export interface ISecurityAnswerRepository {
    /** プリセット質問一覧を取得する */
    listQuestions(): Promise<SecurityQuestionPreset[]>;

    /** 指定ユーザーの秘密の質問を取得する（未設定の場合は null） */
    findQuestionByUserId(userId: string): Promise<{ questionId: number; questionText: string } | null>;

    /** 回答が正しいか照合する */
    verifyAnswer(userId: string, plaintextAnswer: string): Promise<boolean>;

    /** 秘密の質問と回答を保存する（既存があれば上書き） */
    save(userId: string, questionId: number, plaintextAnswer: string): Promise<void>;
}
