import {refreshTokensCollection, requestMeta} from "../db";
import {RefreshTokenDBModel} from "../../models/Auth/TokenModel";

export const jwtRepository = {
    async refreshTokenRecord(token: string, userid: string) {
        const refreshTokenRecord = await refreshTokensCollection.findOne<RefreshTokenDBModel>(
            {
                token: token,
                userId: userid,
                expiresAt: { $gt: new Date() }
            }
        )
        return refreshTokenRecord
    },
    async updateRefreshToken(oldRefreshToken:string,newRefreshToken: string, newExpiresAt: Date): Promise<boolean> {
        const update = await refreshTokensCollection.updateOne(
            { token: oldRefreshToken },
            {
                $set: {
                    token: newRefreshToken,
                    expiresAt: newExpiresAt
                }
            }
        );
        return update.modifiedCount === 1
    },
    async insertRefreshJwtToken(refreshToken: RefreshTokenDBModel): Promise<boolean> {
        const insertToken = await refreshTokensCollection.insertOne(refreshToken)
        if (!insertToken.insertedId) {
            return false
        }
        return true
    },
    async deleteRefreshToken(token: string) {
        const deleted = await refreshTokensCollection.deleteOne({token: token})
        return deleted.deletedCount === 1
    },
    async recordRequestMeta(requestMetaDTO: {ip: string, url: string, date: Date}): Promise<boolean> {
        const insertion = await requestMeta.insertOne(requestMetaDTO)
        if (!insertion.insertedId) {
            return false
        }
        return true
    }
}