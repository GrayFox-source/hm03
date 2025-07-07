import {IGetWithPagination} from "../repositories/interfaces/get-with-pagination.interface";
import {PaginatorUsers} from "../models/User/Paginator-Users";
import {UsersRepository} from "../repositories/Users/users-repository";
import {UserDBModel, UserViewModel} from "../models/User/UserViewModel";
import {UserInputModel} from "../models/User/UserInputModel";
import {usersCollection} from "../repositories/db";
import bcrypt from "bcrypt"
import {ErrorWithValidation} from "../models/Classes/ErrorWithValidation";
import {ResistrationConfirmationCodeModel} from "../models/Auth/ResistrationConfirmationCodeModel";
import {ErrorFieldViewModel} from "../models/ErrorFieldViewModel";
import {add} from 'date-fns'
import { v4 as uuidv4 } from 'uuid';
import {injectable, inject} from "inversify";
import "reflect-metadata"

const SALT_ROUNDS = 10

@injectable()
export class UsersService {
    constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}
    async getAllUsers(dto: IGetWithPagination): Promise<PaginatorUsers> {
        return this.usersRepository.getAllUsers(dto)
    }
    async createNewUser(body: UserInputModel, comfirmationCode: string): Promise<UserViewModel> {
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
        const newUser = new UserDBModel(uuidv4(), body.login, body.email, passwordHash, new Date().toISOString(), {
            confirmationCode: comfirmationCode,
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 3,
            }),
            isConfirmed: false })

        await this.usersRepository.createUser(newUser)
        return {
            id: newUser.id,
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt
        }
    }
    async deleteUserById(id: string): Promise<boolean> {
        return await this.usersRepository.deleteUserById(id)
    }
    async deleteUserByEmail(email: string): Promise<boolean> {
        return await this.usersRepository.deleteUserByEmail(email)
    }
    async findUserByEmail(email: string): Promise<UserDBModel | null> {
        const user = await usersCollection.findOne({email});
        return user ? mapUserDBModelToViewModel(user) : null;
    }
    async findUserByLogin(login: string): Promise<UserDBModel | null> {
        const user = await usersCollection.findOne({login});
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
        const currentDate = new Date()
        if (findUnconfirmedUser && findUnconfirmedUser!.emailConfirmation.expirationDate >= currentDate) {
            const result = await this.usersRepository.updateUserByCode(code)
            return result
        } else {
            errorField.push({error: 'Confirmation code already been expired or apply', field: code.code})
            return errorField
        }
    }

    async setNewPassword(userId: string, newPassword: string): Promise<boolean> {
        const password = await this._hashPassword(newPassword)
        const updated = await this.usersRepository.setNewPassword(userId, password)
        if (updated) {
            return true
        }
        return false
    }
}



function mapUserDBModelToViewModel(dbModel: any): UserDBModel {
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
