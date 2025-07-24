import {BlogsModel, postsCollection} from "./db";
import {BlogViewModel} from "../models/Blogs/BlogViewModel";
import {IGetWithPagination} from "./interfaces/get-with-pagination.interface";
import {PaginatorPosts} from "../models/Posts/Paginator-Posts";
import {PaginatorBlogs} from "../models/Blogs/Paginator-Blogs";


export class BlogsRepository {
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

        const totalCount = await BlogsModel.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)
        const items = await BlogsModel.find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1 : -1}).skip((pageNumber - 1) * pageSize).limit(pageSize)

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items,
        };
    }
    async getBlogByID(id: string): Promise<BlogViewModel | null> {
        const blog: BlogViewModel | null = await BlogsModel.findOne({id: id})
        if (blog) {
            return blog
        } else {
            return null
        }
    }
    async getPostsByBlogId(blogId: string, dto: IGetWithPagination): Promise<PaginatorPosts> {
        const {pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'desc'} = dto
        const filter = {blogId}

        const totalCount = await postsCollection.countDocuments(filter);
        const pagesCount = Math.ceil(totalCount / pageSize);

        const items = await postsCollection
            .find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
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
    }
    async createBlog(newBlog: BlogViewModel): Promise<BlogViewModel> {
        await BlogsModel.insertOne(newBlog)
        return newBlog
    }
    async updateBlogByID(updateBlogDTO: {
        id: string,
        name: string,
        description: string,
        websiteUrl: string
    }): Promise<boolean> {
        const result = await BlogsModel.updateOne({id: updateBlogDTO.id}, {
            $set: {
                name: updateBlogDTO.name,
                description: updateBlogDTO.description, websiteUrl: updateBlogDTO.websiteUrl
            }
        })
        return result.matchedCount === 1
    }
    async deleteBlogByID(id: string): Promise<boolean> {
        const result = await BlogsModel.deleteOne({id: id})
        return result.deletedCount === 1
    }
}


