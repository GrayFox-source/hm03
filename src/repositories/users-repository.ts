import {PaginatorUsers} from "../models/User/Paginator-Users";
import {usersCollection} from "./db";
import {GetWithPaginationUsers} from "./interfaces/get-with-pagination-users";
import {UserViewModel} from "../models/User/UserViewModel";


export const usersRepository = {
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
    },
    async getUserById(id: string): Promise<UserViewModel | null> {
        const findedUser: UserViewModel | null = await usersCollection.findOne({id: id})
        if (findedUser) {
            return findedUser
        } else {
            return null
        }
    },
    async deleteUserById(id: string) {
        const deleted = await usersCollection.deleteOne({id: id})
        return deleted.deletedCount === 1
    },
}