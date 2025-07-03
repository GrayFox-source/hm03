import express, {Request, Response} from 'express';
import bodyParser from 'body-parser'
import {blogsRouter} from "./routes/Blogs/blogs-router";
import {postsRouter} from "./routes/Posts/posts-router";
import {blogsCollection, postsCollection, runDb, usersCollection} from "./repositories/db";
import {usersRouter} from "./routes/Users/users-router";
import {authRouter} from "./routes/Auth/auth-router";
import {commentsRouter} from "./routes/Comments/comments-router";
import cookieParser from "cookie-parser";
import {securityDevicesRouter} from "./routes/SecurityDevices/security-devices-router";

export const app = express()
const PORT = 3003

const middleWare = bodyParser({})

app.use(cookieParser())
app.use(middleWare);
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/security', securityDevicesRouter)

app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({})
    await postsCollection.deleteMany({})
    await usersCollection.deleteMany({})
    res.send(204)
})

const startApp = async () => {
    await runDb()
    app.listen(PORT,() => {
        console.log(`Server working on port ${PORT}`)
    })
}

startApp()

