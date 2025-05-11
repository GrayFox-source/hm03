import {BlogViewModel} from "../models/BlogViewModel";
import {blogsRepository} from "../repositories/blogs-repository";
import {IGetWithPagination} from "../repositories/interfaces/get-with-pagination.interface";
import {BlogPostInputModel} from "../models/BlogPostInputModel";
import {PostViewModel} from "../models/PostViewModel";
import {PostsRepository} from "../repositories/posts-repository";
import {PaginatorPosts} from "../models/Paginator-Posts";
import {PaginatorBlogs} from "../models/Paginator-Blogs";


export const blogsService = {
    async getAllBlogs(dto: IGetWithPagination): Promise<PaginatorBlogs> {
        return blogsRepository.getAllBlogs(dto)
    },
    async getBlogByID(id:string): Promise<BlogViewModel | null> {
        return blogsRepository.getBlogByID(id)
    },
    async getPostsByBlogId(blogId: string, dto: IGetWithPagination): Promise<PaginatorPosts> {
        return blogsRepository.getPostsByBlogId(blogId, dto)
    },
    async createBlog(inputBlogDTO:{name:string, description:string, websiteUrl:string}): Promise<BlogViewModel> {
        const newBlog: BlogViewModel = {
            id: String(+(new Date())),
            name: inputBlogDTO.name,
            description: inputBlogDTO.description,
            websiteUrl: inputBlogDTO.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlog = await blogsRepository.createBlog(newBlog)
        return createdBlog
    },
    async createPostForBlog(blogId: string, inputModel: BlogPostInputModel): Promise<PostViewModel | null> {
        const blog: BlogViewModel | null = await blogsRepository.getBlogByID(blogId);
        if (!blog) return null;

        const newPost: PostViewModel = {
            id: String(+new Date()),
            title: inputModel.title,
            shortDescription: inputModel.shortDescription,
            content: inputModel.content,
            blogId: blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }
        const createdPost = await PostsRepository.createNewPost(newPost);
        return createdPost;
    },
    async updateBlogByID(updateBlogDTO:{id: string,name:string, description:string, websiteUrl:string}): Promise<boolean> {
        return await blogsRepository.updateBlogByID({id: updateBlogDTO.id, name: updateBlogDTO.name, description: updateBlogDTO.description, websiteUrl: updateBlogDTO.websiteUrl})

    },
    async deleteBlogByID(id:string): Promise<boolean> {
        return await blogsRepository.deleteBlogByID(id)
    }
}
