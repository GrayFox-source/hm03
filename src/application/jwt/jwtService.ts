import {UserDBModel} from "../../models/User/UserViewModel";
import jwt from "jsonwebtoken"
import {settings} from "../../settings";

export const jwtService = {
    async createJwtForUser(user: UserDBModel) {
        const token = jwt.sign({userId: user.id},  settings.JWT_SECRET, {expiresIn: "1h"})
        return {
            accessToken: token
        }
    },
    async getIdUserByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result.userId
        } catch (e) {
            return null
        }
    }
}