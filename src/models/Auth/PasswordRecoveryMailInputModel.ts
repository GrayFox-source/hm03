export type PasswordRecoveryMailInputModel = {
    email: string,
}

export type RecoveryCodeDBModel = {
    recoveryCode: string,
    userId: string,
}