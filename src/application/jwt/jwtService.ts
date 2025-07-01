import {UserDBModel, UserViewModel} from "../../models/User/UserViewModel";
import jwt, {JwtPayload} from "jsonwebtoken"
import {settings} from "../../settings";
import {jwtRepository} from "../../repositories/Users/jwt-repository";
import {RefreshTokenDBModel} from "../../models/Auth/TokenModel";

export const jwtService = {
    async createJwtForUser(user: UserViewModel) {
        const accessToken = jwt.sign({userId: user.id},  settings.JWT_ACCESS_SECRET, {expiresIn: "60s"})
        return {
                accessToken: accessToken
            }
    },
    async getIdUserByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_ACCESS_SECRET)
            return result.userId
        } catch (e) {
            return null
        }
    },
    async createRefreshToken(user: UserViewModel) {
        const refreshToken = jwt.sign({userId: user.id}, settings.JWT_REFRESH_SECRET, {expiresIn: "70s"})
        const expiresAt = new Date(Date.now() + 20 * 1000)
        const refreshTokenForInsert = {
            token: refreshToken,
            userId: user.id,
            expiresAt: expiresAt,
        }
        await jwtRepository.insertRefreshJwtToken(refreshTokenForInsert)
        return {refreshToken, expiresAt}
    },
    async verifyUser(refreshToken: string): Promise<string | JwtPayload> {
        const decoded = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET)
        return decoded
    },
    async refreshTokenRecord(token: string, userid: string): Promise<RefreshTokenDBModel | null> {
        const tokenA = await jwtRepository.refreshTokenRecord(token, userid)
        return tokenA
    },
    async updateRefreshToken(user: UserDBModel,oldRefreshToken: string) {
        const refreshToken = jwt.sign({userId: user.id}, settings.JWT_REFRESH_SECRET, {expiresIn: "70s"})
        const expiresAt = new Date(Date.now() + 20 * 1000)
        const refreshTokenForUpdate = {
            token: refreshToken,
            userId: user.id,
            expiresAt: expiresAt,
        }
        await jwtRepository.updateRefreshToken(oldRefreshToken, refreshTokenForUpdate.token, refreshTokenForUpdate.expiresAt)
        return {refreshToken, expiresAt}
    },
    async deleteRefreshToken(token: string) {
        return await jwtRepository.deleteRefreshToken(token)

    },

}