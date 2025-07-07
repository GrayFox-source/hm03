import {PaginatorUsers} from "../../models/User/Paginator-Users";
import {usersCollection} from "../db";
import {GetWithPaginationUsers} from "../interfaces/get-with-pagination-users";
import {UserDBModel} from "../../models/User/UserViewModel";
import {ResistrationConfirmationCodeModel} from "../../models/Auth/ResistrationConfirmationCodeModel";
import {injectable} from "inversify";

@injectable()
export class UsersRepository {
    async getAllUsers(dto: GetWithPaginationUsers): Promise<PaginatorUsers> {
        const filter: Record<string, unknown> = {};
        const sortDirection = dto.sortDirection ?? 'asc';
        const pageNumber = dto.pageNumber ?? 1
        const pageSize = dto.pageSize ?? 10
        const sortBy = dto.sortBy ?? 'createdAt'
        const searchLoginTerm = dto.searchLoginTerm ?? null
        const searchEmailTerm = dto.searchEmailTerm ?? null
        if (searchLoginTerm) {
            filter.name = {
                $regex: dto.searchLoginTerm,
                $options: 'i'
            }
        } else if (searchEmailTerm) {
            filter.email = {
                $regex: dto.searchEmailTerm,
                $options: 'i'
            }
        }


        const totalCount = await usersCollection.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)
        const items = await usersCollection.find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1 : -1}).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items
        }
    }
    async createUser(user: UserDBModel): Promise<boolean> {
        const result = await usersCollection.insertOne(user)
        if (!result.insertedId) {
            return false
        }
        return true
    }
    async getUserById(id: string): Promise<UserDBModel | null> {
        const findedUser: UserDBModel | null = await usersCollection.findOne({id: id})
        if (findedUser) {
            return findedUser
        } else {
            return null
        }
    }
    async deleteUserById(id: string) {
        const deleted = await usersCollection.deleteOne({id: id})
        return deleted.deletedCount === 1
    }
    async deleteUserByEmail(email: string) {
        const deleteUser = await usersCollection.deleteOne({email: email})
        return deleteUser.deletedCount === 1
    }
    async updateUserByCode(code: ResistrationConfirmationCodeModel): Promise<boolean> {
        const updated = await usersCollection.updateOne(
            {"emailConfirmation.confirmationCode": code.code},
            {$set: {"emailConfirmation.isConfirmed": true}})
        return updated.matchedCount === 1
    }
    async getUserByCode(code: ResistrationConfirmationCodeModel): Promise<UserDBModel | null> {
        const data = await usersCollection.findOne({ "emailConfirmation.confirmationCode": code.code });
        if (!data) {
            return null;
        }
        if (data.emailConfirmation.isConfirmed !== false) {
            return null;
        }
        return data;
    }

    async setNewPassword(userId: string, password: string) {
        const updated = await usersCollection.updateOne({id: userId}, {$set :{passwordHash: password}})
        return updated.modifiedCount === 1
    }
}

