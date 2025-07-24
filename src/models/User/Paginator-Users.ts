import {UserViewModel} from "./UserViewModel";

export type PaginatorUsers = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserViewModel[]
}