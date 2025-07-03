import {MongoClient} from "mongodb";
import {BlogViewModel} from "../models/Blogs/BlogViewModel";
import {PostViewModel} from "../models/Posts/PostViewModel";
import dotenv from 'dotenv'
import {UserDBModel} from "../models/User/UserViewModel";
import {CommentViewModel} from "../models/Comment/CommentViewModel";
import {RefreshTokenDBModel} from "../models/Auth/TokenModel";
import {RequestMeta} from "../models/Auth/RequestMeta";
import {DeviceDBModel} from "../models/Auth/DeviceModel";

dotenv.config()

const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017'
const client = new MongoClient(mongoURI);
export const db = client.db('platform')
export const blogsCollection = db.collection<BlogViewModel>('blogs')
export const postsCollection = db.collection<PostViewModel>('posts')

export const usersCollection = db.collection<UserDBModel>('users')

export const commentsCollection = db.collection<CommentViewModel>('comments')

export const refreshTokensCollection = db.collection<RefreshTokenDBModel>('refreshTokens');

export const requestMeta = db.collection<RequestMeta>('requestMeta')

export const devicesCollection = db.collection<DeviceDBModel>('devices')



export async function runDb() {
    try {
        await client.connect()
        await client.db('platform').command({ping: 1})
        console.log('Successful connect to MongoDB')
    } catch {
        console.log('ERROR! Cannot connect to MongoDB')
        await client.close()
    }
}
