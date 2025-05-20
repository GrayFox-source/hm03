import {PostViewModel} from "./PostViewModel";


export type PaginatorPosts = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostViewModel[]
}