import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {commentsRepository} from "../repositories/Comments/comments-repository";

export const commentsService = {
    async getCommentById(id: string): Promise<CommentViewModel | null> {
        return await commentsRepository.getCommentById(id)
    },
    async updateCommentById(dto: {id: string, content: string}) {
        return await  commentsRepository.updateCommentById(dto)
    },
    async deleteCommentById(id: string) {
        return await commentsRepository.deleteCommentById(id)
    },
}