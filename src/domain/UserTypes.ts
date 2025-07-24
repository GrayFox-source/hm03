import {HydratedDocument, Model} from "mongoose";
import {UserDBModel} from "../models/User/UserViewModel";

export type UserDBModelMethodsType = {
    canBeConfirmed: (code: string) => boolean
    confirm: (code: string) => void
}
export type UserModelType = Model<UserDBModel, {}, UserDBModelMethodsType>
export type UsersModelStaticType = Model<UserDBModel> & {
    makeInstance(login: string,
                 email: string,
                 passwordHash: string,
                 confirmationCode: string): HydratedDocument<UserDBModel, UserDBModelMethodsType>
}
export type UserModelFullType = UserModelType & UsersModelStaticType
export type UserDBModelWithoutMethods = Omit<UserDBModel, 'canBeConfirmed' | 'confirm'>;