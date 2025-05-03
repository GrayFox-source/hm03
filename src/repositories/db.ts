import {MongoClient} from "mongodb";
import {BlogViewModel} from "../models/BlogViewModel";
import {PostViewModel} from "../models/PostViewModel";

const mongoURI = process.env.MongoURI || 'mongodb://localhost:27017'
const client = new MongoClient(mongoURI);
export const db = client.db('platform')
export const blogsCollection = db.collection<BlogViewModel>('blogs')
export const postsCollection = db.collection<PostViewModel>('posts')

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
