import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {commentsCollection} from "./db";
import {LikeStatus} from "../models/Comment/LikeInputModel";
import {injectable} from "inversify";

@injectable()
export class CommentsRepository {
    async getCommentById(id: string): Promise<CommentViewModel | null> {
        return commentsCollection.findOne({id: id})
    }

    async updateCommentById(commentData: { id: string, content: string }) {
        return commentsCollection.updateOne({id: commentData.id}, {$set: {content: commentData.content}})
    }

    async deleteCommentById(id: string) {
        return commentsCollection.deleteOne({id: id})
    }

    async updateLikeStatusForCommentById(commentId: string,
                                         likeStatus: LikeStatus,
                                         userId: string): Promise<boolean> {

        const comment = await commentsCollection.findOne({id: commentId});

        if (!comment) return false;

        const currentUserStatus = comment.likesInfo.myStatus;

        let likesDelta = 0;
        let dislikesDelta = 0;

        // Определяем изменения счётчиков
        if (currentUserStatus === 'Like') {
            if (likeStatus === 'Dislike') {
                likesDelta = -1;
                dislikesDelta = +1;
            } else if (likeStatus === 'None') {
                likesDelta = -1; // Уменьшаем likes
            }
        } else if (currentUserStatus === 'Dislike') {
            if (likeStatus === 'Like') {
                dislikesDelta = -1;
                likesDelta = +1;
            } else if (likeStatus === 'None') {
                dislikesDelta = -1; // Уменьшаем dislikes
            }
        } else if (currentUserStatus === 'None') {
            if (likeStatus === 'Like') {
                likesDelta = +1;
            } else if (likeStatus === 'Dislike') {
                dislikesDelta = +1;
            }
            // Если likeStatus === 'None', дельты остаются 0
        }

        // Если статус не изменился и дельта нулевая — ничего не делаем
        if (likesDelta === 0 && dislikesDelta === 0 && currentUserStatus === likeStatus) {
            return true;
        }

        // Обновляем статус и счётчики
        const updateResult = await commentsCollection.updateOne(
            {id: commentId},
            {
                $set: {
                    'likesInfo.myStatus': likeStatus,
                },
                $inc: {
                    'likesInfo.likesCount': likesDelta,
                    'likesInfo.dislikesCount': dislikesDelta,
                },
            }
        );

        return updateResult.matchedCount === 1;
    }
}


