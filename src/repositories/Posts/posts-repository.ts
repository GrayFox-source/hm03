import {PostViewModel} from "../../models/Posts/PostViewModel";
import {commentsCollection, postsCollection} from "../db";
import {CommentViewModel} from "../../models/Comment/CommentViewModel";


export class PostsRepository {
    async getAllPosts(): Promise<PostViewModel[]> {
        return postsCollection.find({}).toArray()
    }
    async getPostById(id: string): Promise<PostViewModel | null> {
        const findPost = await postsCollection.findOne({id: id})
        if (findPost) {
            return findPost
        } else {
            return null
        }
    }
    async createNewPost(newPost: PostViewModel): Promise<PostViewModel> {
        await postsCollection.insertOne(newPost)
        return newPost
    }
    async updatePostById(updatePostDTO: {
        id: string,
        title: string,
        shortDescription: string,
        content: string,
        blogId: string
    }): Promise<boolean> {
        const updatePost = await postsCollection.updateOne({id: updatePostDTO.id}, {
            $set: {
                title: updatePostDTO.title,
                shortDescription: updatePostDTO.shortDescription,
                content: updatePostDTO.content,
                blogId: updatePostDTO.blogId
            }
        })
        return updatePost.matchedCount === 1
    }
    async deletePostById(id: string) {
        const isDeleted = await postsCollection.deleteOne({id: id})
        return isDeleted.deletedCount === 1
    }
    async createCommentForPost(dto: CommentViewModel): Promise<CommentViewModel | null> {
        await commentsCollection.insertOne(dto)
        return dto
    }
}


