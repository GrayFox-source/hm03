import {blogsCollection} from "./db";
import {BlogViewModel} from "../models/BlogViewModel";


export const blogsRepository = {
    async getAllBlogs(): Promise<BlogViewModel[]> {
        return blogsCollection.find({}).toArray()
    },
    async getBlogByID(id:string): Promise<BlogViewModel | null> {
        const blog: BlogViewModel | null = await blogsCollection.findOne({id: id})
        if (blog) {
            return blog
        } else {
            return null
        }
    },
    async createBlog(inputBlogDTO:{name:string, description:string, websiteUrl:string, isMembership: boolean}): Promise<BlogViewModel> {
        const newBlog = {
            id: String(+(new Date())),
            name: inputBlogDTO.name,
            description: inputBlogDTO.description,
            websiteUrl: inputBlogDTO.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
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
