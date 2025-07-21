export interface GetWithPaginationUsers {
    searchLoginTerm?: string,
    searchEmailTerm?: string,
    sortBy?: string,
    sortDirection?: string,
    pageNumber?: number,
    pageSize?: number
}