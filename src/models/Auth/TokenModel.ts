export type AccessTokenModel = {
    accessToken: string,
    userId: string,
    expiresAt: Date;
}

export type RefreshTokenDBModel = {
    token: string;
    userId: string;
    expiresAt: Date;
};