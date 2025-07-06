import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {CommentsRepository} from "../repositories/Comments/comments-repository";


export class CommentsService {
    commentsRepository: CommentsRepository
    constructor() {
        this.commentsRepository = new CommentsRepository()
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
}


