import {BlogViewModel} from "../models/Blogs/BlogViewModel";
import {BlogsRepository} from "../infrastucture/blogs-repository";
import {IGetWithPagination} from "../infrastucture/interfaces/get-with-pagination.interface";
import {BlogPostInputModel} from "../models/BlogPostInputModel";
import {PostViewModel} from "../models/Posts/PostViewModel";
import {PostsRepository} from "../infrastucture/posts-repository";
import {PaginatorPosts} from "../models/Posts/Paginator-Posts";
import {PaginatorBlogs} from "../models/Blogs/Paginator-Blogs";
import {PostModel} from "../infrastucture/db";


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
        return await this.blogsRepository.createBlog(newBlog)
    }


    async createPostForBlog(blogId: string, inputModel: BlogPostInputModel): Promise<PostViewModel | null> {
        const blog: BlogViewModel | null = await this.blogsRepository.getBlogByID(blogId);
        if (!blog) return null;
        const createDTO = {
            title: inputModel.title,
            shortDescription: inputModel.shortDescription,
            content: inputModel.content,
            blogId: blogId,
        }
        const newPost = PostModel.createPost(createDTO, blog.name)
        await this.postsRepository.save(newPost)
        console.log(newPost)
        return newPost;
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


