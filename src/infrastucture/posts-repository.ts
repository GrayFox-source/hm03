import {PostViewModel} from "../models/Posts/PostViewModel";
import {commentsCollection, LikeRecordModel, PostModel} from "./db";
import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {PaginatorPosts} from "../models/Posts/Paginator-Posts";
import {IGetWithPagination, IGetWithPaginationPost} from "./interfaces/get-with-pagination.interface";
import {PaginatorCommentViewModel} from "../models/Comment/Paginator-CommentViewModel";
import {CommentsRepository} from "./comments-repository";
import {LikeStatus} from "../models/Comment/LikeInputModel";


export class PostsRepository {
    private CommentsRepository: CommentsRepository

    constructor() {
        this.CommentsRepository = new CommentsRepository()
    }

    async getAllPosts(dto: IGetWithPagination): Promise<PaginatorPosts> {
        await PostModel.find({})
        return PostModel.getPagination(dto)
    }

    async getCommentsForPost(dto: IGetWithPaginationPost, postId: string): Promise<PaginatorCommentViewModel> {
        const {pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'desc'} = dto
        const totalCount = await commentsCollection.countDocuments()
        const pagesCount = Math.ceil(totalCount / pageSize)
        const filter = {}
        const post = await PostModel.findOne({id: postId})
        if (!post) throw new Error('Post with this ID is does not exist')
        const items = await commentsCollection
            .find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize).toArray()
        ;
        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items,
        };
    }

    async getPostById(id: string): Promise<PostViewModel | null> {
        const findPost = await PostModel.findOne({id: id})
        if (findPost) {
            return findPost
        } else {
            return null
        }
    }

    async updatePostById(updatePostDTO: {
        id: string,
        title: string,
        shortDescription: string,
        content: string,
        blogId: string
    }): Promise<boolean> {
        await PostModel.updatePost(updatePostDTO)
        return true
    }

    async save(model: any) {
        return model.save()
    }

    async deletePostById(id: string) {
        const isDeleted = await PostModel.deleteOne({id: id})
        return isDeleted.deletedCount === 1
    }

    async createCommentForPost(dto: CommentViewModel): Promise<CommentViewModel | null> {
        await commentsCollection.insertOne(dto)
        return dto
    }

    async updateLikeStatusForPostById(
        postId: string,
        likeStatus: LikeStatus,
        userId: string,
        userLogin: string
    ): Promise<boolean> {
        const post = await PostModel.findOne({id: postId});

        if (!post) return false;
        const reaction = userId
            ? await LikeRecordModel.findOne({postId, userId})
            : null;

        const prevUserStatus = reaction?.myStatus || 'None'
        if (!reaction) {
            const newReaction = new LikeRecordModel({
                userId,
                postId,
                myStatus: likeStatus,
                login: userLogin,
                addedAt: new Date(),
            });
            await newReaction.save();
        }

        let likesDelta = 0;
        let dislikesDelta = 0;

        if (prevUserStatus) {
            if (prevUserStatus === 'Like' && likeStatus === 'Dislike') {
                likesDelta = -1;
                dislikesDelta = +1;
            } else if (prevUserStatus === 'Like' && likeStatus === 'None') {
                likesDelta = -1;
            } else if (prevUserStatus === 'Dislike' && likeStatus === 'Like') {
                dislikesDelta = -1;
                likesDelta = +1;
            } else if (prevUserStatus === 'Dislike' && likeStatus === 'None') {
                dislikesDelta = -1;
            } else if (prevUserStatus === 'None' && likeStatus === 'Like') {
                likesDelta = +1;
            } else if (prevUserStatus === 'None' && likeStatus === 'Dislike') {
                dislikesDelta = +1;
            } else {
                return true; // нет изменений
            }
        } else {
            if (likeStatus === 'Like') likesDelta = +1;
            else if (likeStatus === 'Dislike') dislikesDelta = +1;
        }
        // Обновляем или создаём реакцию
        if (likeStatus === 'None') {
            await LikeRecordModel.deleteOne({postId, userId});
        } else {
            await LikeRecordModel.updateOne(
                {postId, userId},
                {$set: {myStatus: likeStatus, login: userLogin}, $setOnInsert: {addedAt: new Date()},
            }, {upsert: true},
            );
        }

        // Обновляем счётчики в посте
        if (likesDelta !== 0 || dislikesDelta !== 0) {
            await PostModel.updateOne(
                {id: postId},
                {
                    $inc: {
                        'likesInfo.likesCount': likesDelta,
                        'likesInfo.dislikesCount': dislikesDelta
                    }
                }
            );
        }

        // Обновляем newestLikes
        await this.updateNewestLikes(postId);
        return true;

    }
    private async updateNewestLikes(postId: string) {
        const reactions = await LikeRecordModel.find({ postId, myStatus: 'Like' })
            .sort({ addedAt: -1 })
            .limit(3);
        console.log('reactions', reactions);
        const newestLikes = reactions.map(r => ({
            addedAt: r.addedAt,
            userId: r.userId,
            login: r.login
        }));
        console.log('Newest Likes', newestLikes)

        await PostModel.updateOne(
            { id: postId },
            { $set: { 'likesInfo.newestLikes': newestLikes } },
        );
        console.log('after update', await PostModel.findOne({id: postId}))
    }
}


