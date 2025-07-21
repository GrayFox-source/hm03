import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {CommentsRepository} from "../infrastucture/comments-repository";
import {LikeStatus} from "../models/Comment/LikeInputModel";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsService {
    constructor(@inject(CommentsRepository) private commentsRepository: CommentsRepository) {
    }
    async getCommentById(id: string): Promise<CommentViewModel | null> {
        return await this.commentsRepository.getCommentById(id)
    }
    async updateCommentById(dto: {id: string, content: string}) {
        return await  this.commentsRepository.updateCommentById(dto)
    }
    async deleteCommentById(id: string) {
        return await this.commentsRepository.deleteCommentById(id)
    }

    async setLikeStatus(commentId: string, likeStatus: LikeStatus, userId: string): Promise<boolean> {
        return await this.commentsRepository.updateLikeStatusForCommentById(commentId, likeStatus, userId)
    }
}


