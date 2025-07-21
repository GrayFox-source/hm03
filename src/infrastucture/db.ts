import {MongoClient} from "mongodb";
import {BlogViewModel} from "../models/Blogs/BlogViewModel";
import {PostViewModel} from "../models/Posts/PostViewModel";
import dotenv from 'dotenv'
import {UserDBModel} from "../models/User/UserViewModel";
import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {RefreshTokenDBModel} from "../models/Auth/TokenModel";
import {RequestMeta} from "../models/Auth/RequestMeta";
import {DeviceDBModel} from "../models/Auth/DeviceModel";
import {RecoveryCodeDBModel} from "../models/Auth/PasswordRecoveryMailInputModel";
import mongoose, {Model} from "mongoose";
import {IGetWithPagination} from "./interfaces/get-with-pagination.interface";
import {PaginatorPosts} from "../models/Posts/Paginator-Posts";
import {LikeRecordForPostInfo} from "../models/Posts/LikeRecordForPostInfo";

dotenv.config()

const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017'
const client = new MongoClient(mongoURI);
export const db = client.db('platform')
export const blogsCollection = db.collection<BlogViewModel>('blogs')

const BlogsSchema = new mongoose.Schema<BlogViewModel>({
    id: String,
    name: String,
    description: String,
    websiteUrl: String,
    createdAt: String,
    isMembership: Boolean,
})

export const BlogsModel = mongoose.model('Blogs', BlogsSchema)


const LikeRecordSchema = new mongoose.Schema<LikeRecordForPostInfo>({
    userId: {type: "String"},
    myStatus: {type: String, enum: ['Like', 'Dislike', 'None'], default: 'None'},
    postId: String,
    login: String,
    addedAt: "Date",
})

export const LikeRecordModel = mongoose.model('LikeRecord', LikeRecordSchema)

const ExtendedLikesInfoSchema = new mongoose.Schema({
    likesCount: {type: Number, default: 0},
    dislikesCount: {type: Number, default: 0},
    // или enum
    newestLikes: [{
        userId: String,
        login: String,
        addedAt: String
    }]
});

export const ExtendedLikeInfoModel = mongoose.model('ExtendedLikes', ExtendedLikesInfoSchema)


export const PostSchema = new mongoose.Schema<PostViewModel>({
    id: String,
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String,
    likesInfo: ExtendedLikesInfoSchema
})

export type PostModelStaticType = Model<PostViewModel> & {
    getPagination(dto: IGetWithPagination): Promise<PaginatorPosts>
    createPost(createPostDTO: {
        title: string,
        shortDescription: string,
        content: string,
        blogId: string
    }, blogName: string): Promise<PostViewModel>
    updatePost(updatePostDTO: {
        id: string,
        title: string,
        shortDescription: string,
        content: string,
        blogId: string
    }): void
}

PostSchema.static('getPagination', async function getPagination(dto: IGetWithPagination) {
    const {pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'desc'} = dto
    const totalCount = await this.countDocuments()
    const pagesCount = Math.ceil(totalCount / pageSize)
    const filter = {}
    const items = await this
        .find(filter).sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
    ;
    await this.find({filter})
    return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items,
    };
})

PostSchema.static('createPost', async function createPost(createPostDTO: {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}, blogName: string) {
    return this.create({
        id: String(+(new Date())),
        title: createPostDTO.title,
        shortDescription: createPostDTO.shortDescription,
        content: createPostDTO.content,
        blogId: createPostDTO.blogId,
        blogName: blogName,
        createdAt: new Date().toISOString(),
        likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: []
        }
    })

})

PostSchema.static('updatePost', async function updatePost(updatePostDTO: {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}) {
    const findPost = await PostModel.findOne({id: updatePostDTO.id})
    if (!findPost) throw new Error('Post with this id does not exist')
    findPost.title = updatePostDTO.title
    findPost.shortDescription = updatePostDTO.shortDescription
    findPost.content = updatePostDTO.content
    findPost.blogId = updatePostDTO.blogId
    await findPost.save()
})

export type PostViewModelWithoutMethods = Omit<PostViewModel, 'getPagination'>;

export const PostModel = mongoose.model<PostViewModel, PostModelStaticType>('Posts', PostSchema)


export const postsCollection = db.collection<PostViewModel>('posts')

export const usersCollection = db.collection<UserDBModel>('users')

export const commentsCollection = db.collection<CommentViewModel>('comments')

export const refreshTokensCollection = db.collection<RefreshTokenDBModel>('refreshTokens');

export const requestMeta = db.collection<RequestMeta>('requestMeta')

export const devicesCollection = db.collection<DeviceDBModel>('devices')

export const recoveryCodeCollection = db.collection<RecoveryCodeDBModel>('passwordRecoveryCodes')


export async function runDb() {
    try {
        await mongoose.connect(mongoURI)
        await client.db('platform').command({ping: 1})
        console.log('Successful connect to MongoDB')
    } catch {
        console.log('ERROR! Cannot connect to MongoDB')
        await mongoose.disconnect()
    }
}
