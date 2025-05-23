import {CommentViewModel} from "../../models/Comment/CommentViewModel";
import {commentsCollection} from "../db";

export const commentsRepository = {
    async getCommentById(id: string): Promise<CommentViewModel | null> {
        return commentsCollection.findOne({id: id})
    },
    async updateCommentById(commentData: { id: string, content: string }) {
        return commentsCollection.updateOne({id: commentData.id}, {$set: {content: commentData.content}})
    },
    async deleteCommentById(id: string) {
        return commentsCollection.deleteOne({id: id})
    },
}