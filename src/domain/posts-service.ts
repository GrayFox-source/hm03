import {PostViewModel} from "../models/Posts/PostViewModel";
import {PostsRepository} from "../repositories/posts-repository";

export const postsService = {
    async getAllPosts(): Promise<PostViewModel[]> {
        return PostsRepository.getAllPosts()
    },
    async getPostById(id:string): Promise<PostViewModel | null> {
        return PostsRepository.getPostById(id)
    },
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
        const createdPost = await PostsRepository.createNewPost(newPost)
        return createdPost
    },
    async updatePostById(updatePostDTO:{id:string, title: string, shortDescription: string, content: string, blogId: string}): Promise<boolean> {
        return await PostsRepository.updatePostById({id: updatePostDTO.id, title: updatePostDTO.title, shortDescription: updatePostDTO.shortDescription, content: updatePostDTO.content, blogId:updatePostDTO.blogId})
    },
    async deletePostById(id:string) {
        return await PostsRepository.deletePostById(id)
    }
}
