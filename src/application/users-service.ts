import {IGetWithPagination} from "../infrastucture/interfaces/get-with-pagination.interface";
import {PaginatorUsers} from "../models/User/Paginator-Users";
import {UsersRepository} from "../infrastucture/users-repository";
import {UserDBModel, UserViewModel} from "../models/User/UserViewModel";
import {UserInputModel} from "../models/User/UserInputModel";
import {usersCollection} from "../infrastucture/db";
import bcrypt from "bcrypt"
import {ErrorWithValidation} from "../models/Classes/ErrorWithValidation";
import {ResistrationConfirmationCodeModel} from "../models/Auth/ResistrationConfirmationCodeModel";
import {ErrorFieldViewModel} from "../models/ErrorFieldViewModel";
import {add} from 'date-fns'
import {injectable, inject} from "inversify";
import "reflect-metadata"
import {UserModel} from "../domain/UsersEntity";
import {UserDBModelWithoutMethods} from "../domain/UserTypes";

const SALT_ROUNDS = 10

@injectable()
export class UsersService {
    constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}
    async getAllUsers(dto: IGetWithPagination): Promise<PaginatorUsers> {
        return this.usersRepository.getAllUsers(dto)
    }
    async createNewUser(body: UserInputModel, confirmationCode: string): Promise<UserViewModel> {
        const correctLogin = await usersCollection.findOne({login: body.login})
        const correctEmail = await usersCollection.findOne({email: body.email})
        const errors = []

        if (correctLogin) {
            errors.push({field: 'login', message: 'login should be unique'});
        }

        if (correctEmail) {
            errors.push({field: 'email', message: 'email should be unique'});
        }

        if (errors.length > 0) {
            throw new ErrorWithValidation(errors);
        }

        const passwordHash = await this._hashPassword(body.password)
        const newUserDTO = UserModel.makeInstance(body.login, body.email, passwordHash, confirmationCode)
        const smartUserModel = new UserModel(newUserDTO)
        await this.usersRepository.save(smartUserModel)
        return {
            id: newUserDTO.id,
            login: newUserDTO.login,
            email: newUserDTO.email,
            createdAt: newUserDTO.createdAt
        }
    }
    async deleteUserById(id: string): Promise<boolean> {
        return await this.usersRepository.deleteUserById(id)
    }
    async deleteUserByEmail(email: string): Promise<boolean> {
        return await this.usersRepository.deleteUserByEmail(email)
    }
    async findUserByEmail(email: string): Promise<UserDBModelWithoutMethods | null> {
        const user = await UserModel.findOne({email});
        return user ? mapUserDBModelToViewModel(user) : null;
    }
    async findUserByLogin(login: string): Promise<UserDBModelWithoutMethods | null> {
        const user = await UserModel.findOne({login});
        return user ? mapUserDBModelToViewModel(user) : null;
    }
    async findUserById(id: string): Promise<UserDBModel | null> {
        return await this.usersRepository.getUserById(id)
    }
    async _hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }
    async updateUserByCode(code: ResistrationConfirmationCodeModel): Promise<boolean | ErrorFieldViewModel[]> {
        const findUnconfirmedUser = await this.usersRepository.getUserByCode(code)
        const errorField: ErrorFieldViewModel[] = []
        if (!findUnconfirmedUser) return false
        if (findUnconfirmedUser.canBeConfirmed(code.code)) {
            const result = await this.usersRepository.save(findUnconfirmedUser)
            return result
        } else {
            errorField.push({error: 'Confirmation code already been expired or apply', field: code.code})
            return errorField
        }
    }

    async setNewPassword(userId: string, newPassword: string): Promise<boolean> {
        const password = await this._hashPassword(newPassword)
        const updated = await this.usersRepository.setNewPassword(userId, password)
        if (updated) return true
        return false
    }
}



function mapUserDBModelToViewModel(dbModel: any): UserDBModelWithoutMethods {
    return {
        id: dbModel.id,
        login: dbModel.login,
        email: dbModel.email,
        passwordHash: dbModel.passwordHash,
        createdAt: dbModel.createdAt,
        emailConfirmation: {
            confirmationCode: dbModel.confirmationCode,
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 3,
            }),
            isConfirmed: false
        },
    };
}
