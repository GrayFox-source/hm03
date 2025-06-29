import {refreshTokensCollection} from "../db";
import {RefreshTokenDBModel} from "../../models/Auth/TokenModel";

export const jwtRepository = {
    async refreshTokenRecord(token: string, userid: string) {
        const refreshTokenRecord = refreshTokensCollection.findOne<RefreshTokenDBModel>(
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
    }
}