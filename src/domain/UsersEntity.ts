import mongoose from "mongoose";
import {UserDBModel} from "../models/User/UserViewModel";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {UserModelFullType, UsersModelStaticType} from "./UserTypes";

export const UserSchema = new mongoose.Schema<UserDBModel, UsersModelStaticType, UserModelFullType>({
    id: String,
    login: String,
    email: String,
    passwordHash: String,
    createdAt: String,
    emailConfirmation: {
    confirmationCode: String,
        expirationDate: Date,
        isConfirmed: Boolean,
}
})

// Fabric static method to create users.
UserSchema.static('makeInstance', function makeInstance(login: string, email: string, passwordHash: string, confirmationCode: string) {
    return new UserDBModel(uuidv4(), login, email, passwordHash, new Date().toISOString(), {
        confirmationCode: confirmationCode,
        expirationDate: add(new Date(), {
            hours: 1,
            minutes: 3,
        }),
        isConfirmed: false})
})

// Instance methods to check validation
UserSchema.method('canBeConfirmed', function canBeConfirmed(code: string) {
    return this.emailConfirmation.confirmationCode === code && this.emailConfirmation.expirationDate >= new Date()
})
UserSchema.method('confirm', function confirm(code: string) {
    if (this.canBeConfirmed(code)) {
        if (this.emailConfirmation.isConfirmed === true) throw new Error('This user is already confirmed')
        this.emailConfirmation.isConfirmed = true
    } else{
        throw new Error('User cannot to be confirmed')
    }



})

export const UserModel = mongoose.model<UserDBModel, UsersModelStaticType>('users', UserSchema)