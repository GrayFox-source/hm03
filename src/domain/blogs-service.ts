import {BlogViewModel} from "../models/Blogs/BlogViewModel";
import {BlogsRepository} from "../repositories/Blogs/blogs-repository";
import {IGetWithPagination} from "../repositories/interfaces/get-with-pagination.interface";
import {BlogPostInputModel} from "../models/BlogPostInputModel";
import {PostViewModel} from "../models/Posts/PostViewModel";
import {PostsRepository} from "../repositories/Posts/posts-repository";
import {PaginatorPosts} from "../models/Posts/Paginator-Posts";
import {PaginatorBlogs} from "../models/Blogs/Paginator-Blogs";


export class BlogsService {
    private blogsRepository: BlogsRepository;
    private postsRepository: PostsRepository
    constructor() {
        this.blogsRepository = new BlogsRepository()
        this.postsRepository = new PostsRepository()
    }

    async getAllBlogs(dto: IGetWithPagination): Promise<PaginatorBlogs> {
        return this.blogsRepository.getAllBlogs(dto)
    }

    async getBlogByID(id: string): Promise<BlogViewModel | null> {
        return this.blogsRepository.getBlogByID(id)
    }


    async getPostsByBlogId(blogId: string, dto: IGetWithPagination): Promise<PaginatorPosts> {
        return this.blogsRepository.getPostsByBlogId(blogId, dto)
    }


    async createBlog(inputBlogDTO: { name: string, description: string, websiteUrl: string }): Promise<BlogViewModel> {
        const newBlog: BlogViewModel = {
            id: String(+(new Date())),
            name: inputBlogDTO.name,
            description: inputBlogDTO.description,
            websiteUrl: inputBlogDTO.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlog = await this.blogsRepository.createBlog(newBlog)
        return createdBlog
    }


    async createPostForBlog(blogId: string, inputModel: BlogPostInputModel): Promise<PostViewModel | null> {
        const blog: BlogViewModel | null = await this.blogsRepository.getBlogByID(blogId);
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
        const createdPost = await this.postsRepository.createNewPost(newPost);
        console.log(createdPost)
        return createdPost;
    }


    async updateBlogByID(updateBlogDTO: {
        id: string,
        name: string,
        description: string,
        websiteUrl: string
    }): Promise<boolean> {
        return await this.blogsRepository.updateBlogByID({
            id: updateBlogDTO.id,
            name: updateBlogDTO.name,
            description: updateBlogDTO.description,
            websiteUrl: updateBlogDTO.websiteUrl
        })

    }

    async deleteBlogByID(id: string): Promise<boolean> {
        return await this.blogsRepository.deleteBlogByID(id)
    }
}


