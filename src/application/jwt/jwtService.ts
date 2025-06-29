import {UserViewModel} from "../../models/User/UserViewModel";
import jwt from "jsonwebtoken"
import {settings} from "../../settings";
import {jwtRepository} from "../../repositories/Users/jwt-repository";
import {RefreshTokenDBModel} from "../../models/Auth/TokenModel";

export const jwtService = {
    async createJwtForUser(user: UserViewModel) {
        const accessToken = jwt.sign({userId: user.id},  settings.JWT_ACCESS_SECRET, {expiresIn: "10s"})
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
        const refreshToken = jwt.sign({userId: user.id}, settings.JWT_REFRESH_SECRET, {expiresIn: "20s"})
        const expiresAt = new Date(Date.now() + 20 * 1000)
        return {refreshToken, expiresAt}
    },
    async findToken() {

    },
    async verifyUser(refreshToken: string) {
        const decoded = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET) as {
            id: string,
            login: string,
            email: string,
            createdAt: string}
        return decoded
    },
    async refreshTokenRecord(token: string, userid: string): Promise<RefreshTokenDBModel | null> {
        return await jwtRepository.refreshTokenRecord(token, userid)
    },
    async updateRefreshToken(oldRefreshToken: string,newRefreshToken: string, newExpiresAt: Date) {
        return await jwtRepository.updateRefreshToken(oldRefreshToken, newRefreshToken, newExpiresAt)
    }


}