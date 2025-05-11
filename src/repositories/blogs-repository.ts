import {blogsCollection, postsCollection} from "./db";
import {BlogViewModel} from "../models/BlogViewModel";
import {IGetWithPagination} from "./interfaces/get-with-pagination.interface";
import {BlogPostInputModel} from "../models/BlogPostInputModel";
import {PaginatorPosts} from "../models/Paginator-Posts";
import {PaginatorBlogs} from "../models/Paginator-Blogs";



export const blogsRepository = {
    async getAllBlogs(dto: IGetWithPagination): Promise<PaginatorBlogs> {
        const filter: Record<string, unknown> = {};
        const sortDirection = dto.sortDirection ?? 'asc';
        const pageNumber = dto.pageNumber ?? 1
        const pageSize = dto.pageSize ?? 10
        const sortBy = dto.sortBy ?? 'createdAt'
        const searchNameTerm = dto.searchNameTerm ?? null
        if (searchNameTerm) {
            filter.name = {
                $regex: dto.searchNameTerm,
                $options: 'i'
            }
        }

        const totalCount = await blogsCollection.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)
        const items = await blogsCollection.find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1 : -1}).skip((pageNumber -1) * pageSize).limit(pageSize).toArray()

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items,
        };
    },
    async getBlogByID(id:string): Promise<BlogViewModel | null> {
        const blog: BlogViewModel | null = await blogsCollection.findOne({id: id})
        if (blog) {
            return blog
        } else {
            return null
        }
    },
    async getPostsByBlogId(blogId: string, dto: IGetWithPagination): Promise<PaginatorPosts> {
        const {pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'desc' } = dto
        const filter = {blogId}

        const totalCount = await postsCollection.countDocuments(filter);
        const pagesCount = Math.ceil(totalCount / pageSize);

        const items = await postsCollection
            .find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1: -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items,
        };
    },
    async createBlog(newBlog: BlogViewModel): Promise<BlogViewModel> {
        const result = await blogsCollection.insertOne(newBlog)
        return newBlog
    },
    async updateBlogByID(updateBlogDTO:{id: string,name:string, description:string, websiteUrl:string}): Promise<boolean> {
        const result = await blogsCollection.updateOne({id: updateBlogDTO.id}, {$set: {name:updateBlogDTO.name,
            description: updateBlogDTO.description, websiteUrl: updateBlogDTO.websiteUrl}})
        return result.matchedCount === 1
    },
    async deleteBlogByID(id:string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({id: id})
        return result.deletedCount === 1
    }
}
