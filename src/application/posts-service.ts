import {PostViewModel} from "../models/Posts/PostViewModel";
import {PostsRepository} from "../infrastucture/posts-repository";
import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {LikeStatus} from "../models/Comment/LikeInputModel";
import {IGetWithPagination, IGetWithPaginationPost} from "../infrastucture/interfaces/get-with-pagination.interface";
import {PaginatorPosts} from "../models/Posts/Paginator-Posts";
import {PostModel} from "../infrastucture/db";
import {BlogsRepository} from "../infrastucture/blogs-repository";
import {PaginatorCommentViewModel} from "../models/Comment/Paginator-CommentViewModel";
import {UserModel} from "../domain/UsersEntity";


export class PostsService {
    PostsRepository: PostsRepository
    BlogsRepository: BlogsRepository
    constructor() {
        this.PostsRepository = new PostsRepository()
        this.BlogsRepository = new BlogsRepository()
    }
    async getAllPosts(dto: IGetWithPagination): Promise<PaginatorPosts> {
        return this.PostsRepository.getAllPosts(dto)
    }

    async getCommentsForPost(dto: IGetWithPaginationPost, postId: string): Promise<PaginatorCommentViewModel> {
        return this.PostsRepository.getCommentsForPost(dto, postId)
    }
    async getPostById(id:string): Promise<PostViewModel | null> {
        return this.PostsRepository.getPostById(id)
    }
    async createNewPost(createPostDTO:{title: string, shortDescription: string, content: string, blogId: string}): Promise<PostViewModel | null> {
        const blog = await this.BlogsRepository.getBlogByID(createPostDTO.blogId)
        if (!blog) return null
        const createdPost = await PostModel.createPost(createPostDTO, blog.name)
        await this.PostsRepository.save(createdPost)
        return createdPost
    }
    async updatePostById(updatePostDTO:{id:string, title: string, shortDescription: string, content: string, blogId: string}): Promise<boolean> {
        return await this.PostsRepository.updatePostById({id: updatePostDTO.id, title: updatePostDTO.title, shortDescription: updatePostDTO.shortDescription, content: updatePostDTO.content, blogId:updatePostDTO.blogId})
    }
    async deletePostById(id:string) {
        return await this.PostsRepository.deletePostById(id)
    }
    async createCommentForPost(commentDTO: {postId: string, content: string, userId: string, userLogin: string}): Promise<CommentViewModel | null> {
        const findedPost = await this.PostsRepository.getPostById(commentDTO.postId)
        if (!findedPost) {
            return null
        }

        const newComment = {
            id: String(+(new Date())),
            content: commentDTO.content,
            commentatorInfo: {
                userId: commentDTO.userId,
                userLogin: commentDTO.userLogin
            },
            createdAt: (new Date()).toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.none
            }
        }

        const result = await this.PostsRepository.createCommentForPost(newComment)
        return result
    }

    async setLikeStatus(postId: string, likeStatus: LikeStatus, userId: string): Promise<boolean> {
        const user = await UserModel.findOne({id: userId})
        if (!user) throw new Error('You are not allowed to set likes/dislikes')
        return await this.PostsRepository.updateLikeStatusForPostById(postId, likeStatus, userId, user.login)
    }
}


