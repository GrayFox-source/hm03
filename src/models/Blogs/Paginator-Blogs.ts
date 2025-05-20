import {BlogViewModel} from "./BlogViewModel";

export type PaginatorBlogs = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogViewModel[]
}