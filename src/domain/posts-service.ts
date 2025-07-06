import {PostViewModel} from "../models/Posts/PostViewModel";
import {PostsRepository} from "../repositories/Posts/posts-repository";
import {CommentViewModel} from "../models/Comment/CommentViewModel";


export class PostsService {
    PostsRepository: PostsRepository
    constructor() {
        this.PostsRepository = new PostsRepository()
    }
    async getAllPosts(): Promise<PostViewModel[]> {
        return this.PostsRepository.getAllPosts()
    }
    async getPostById(id:string): Promise<PostViewModel | null> {
        return this.PostsRepository.getPostById(id)
    }
    async createNewPost(createPostDTO:{title: string, shortDescription: string, content: string, blogId: string}): Promise<PostViewModel> {
        const newPost = {
            id: String(+(new Date())),
            title: createPostDTO.title,
            shortDescription: createPostDTO.shortDescription,
            content: createPostDTO.content,
            blogId: createPostDTO.blogId,
            blogName: 'string',
            createdAt: new Date().toISOString()
        }
        const createdPost = await this.PostsRepository.createNewPost(newPost)
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
        }

        const result = await this.PostsRepository.createCommentForPost(newComment)
        return result
    }
}


