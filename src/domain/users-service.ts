import {IGetWithPagination} from "../repositories/interfaces/get-with-pagination.interface";
import {PaginatorUsers} from "../models/User/Paginator-Users";
import {usersRepository} from "../repositories/Users/users-repository";
import {UserDBModel, UserViewModel} from "../models/User/UserViewModel";
import {UserInputModel} from "../models/User/UserInputModel";
import {usersCollection} from "../repositories/db";
import bcrypt from "bcrypt"
import {ErrorWithValidation} from "../models/Classes/ErrorWithValidation";
import {ResistrationConfirmationCodeModel} from "../models/Auth/ResistrationConfirmationCodeModel";
import {ErrorFieldViewModel} from "../models/ErrorFieldViewModel";

const SALT_ROUNDS = 10


export const usersService = {
    async getAllUsers(dto: IGetWithPagination): Promise<PaginatorUsers> {
        return usersRepository.getAllUsers(dto)
    },
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

        const passwordHash = await this._hashPassword(body.password,)

        const newUser: UserDBModel = {
            id: String(+(new Date())),
            login: body.login,
            email: body.email,
            passwordHash,
            createdAt: new Date().toISOString(),
            confirmed: false,
            confirmationCode: comfirmationCode
        }

        await usersCollection.insertOne(newUser)
        return {
            id: newUser.id,
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt
        }
    },
    async deleteUserById(id: string): Promise<boolean> {
        return await usersRepository.deleteUserById(id)
    },
    async findUserByEmail(email: string): Promise<UserDBModel | null> {
        const user = await usersCollection.findOne({email});
        return user ? mapUserDBModelToViewModel(user) : null;
    },
    async findUserByLogin(login: string): Promise<UserDBModel | null> {
        const user = await usersCollection.findOne({login});
        return user ? mapUserDBModelToViewModel(user) : null;
    },
    async findUserById(id: string): Promise<UserDBModel | null> {
        return await usersRepository.getUserById(id)
    },
    async _hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    },
    async updateUserByCode(code: ResistrationConfirmationCodeModel): Promise<boolean | ErrorFieldViewModel[]> {
        const findUnconfirmedUser = await usersRepository.getUserByCode(code)
        const errorField: ErrorFieldViewModel[] = []
        if (findUnconfirmedUser) {
            const result = await usersRepository.updateUserByCode(code)
            return result
        } else {
            errorField.push({error: 'Confirmation code already been expired or apply', field: code.code})
            return errorField
        }
    },
}

function mapUserDBModelToViewModel(dbModel: any): UserDBModel {
    return {
        id: dbModel.id,
        login: dbModel.login,
        email: dbModel.email,
        passwordHash: dbModel.passwordHash,
        createdAt: dbModel.createdAt,
        confirmed: false,
        confirmationCode: dbModel.confirmationCode
    };
}
