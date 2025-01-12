export enum errorModel {
    'AUTHENTICATION_FAILD' = 'authenticationFailed',
    'NOT_FOUND' = 'notFound',
}

export const errorMessage: { [key: string]: string } = {
    authenticationFailed: 'パスワードが正しくありません',
    notFound: 'ユーザーが登録されていません',
}
