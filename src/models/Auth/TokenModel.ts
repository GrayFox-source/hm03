export type AccessTokenModel = {
    accessToken: string,
}

export type RefreshTokenDBModel = {
    token: string;
    userId: string;
    expiresAt: Date;
};