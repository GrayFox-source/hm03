import {IGetWithPagination} from "../repositories/interfaces/get-with-pagination.interface";
import {PaginatorUsers} from "../models/User/Paginator-Users";
import {usersRepository} from "../repositories/users-repository";
import {UserDBModel, UserViewModel} from "../models/User/UserViewModel";
import {UserInputModel} from "../models/User/UserInputModel";
import {usersCollection} from "../repositories/db";
import bcrypt from "bcrypt"
import {ErrorWithValidation} from "../models/Classes/ErrorWithValidation";

const SALT_ROUNDS = 10


export const usersService = {
    async getAllUsers(dto: IGetWithPagination): Promise<PaginatorUsers> {
        return usersRepository.getAllUsers(dto)
    },
    async createNewUser(body: UserInputModel): Promise<UserViewModel> {
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
            createdAt: new Date().toISOString()
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
    async _hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    },
}

function mapUserDBModelToViewModel(dbModel: any): UserDBModel {
    return {
        id: dbModel.id,
        login: dbModel.login,
        email: dbModel.email,
        passwordHash: dbModel.passwordHash,
        createdAt: dbModel.createdAt,
    };
}
