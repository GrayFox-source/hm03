import express, {Request, Response} from 'express';
import bodyParser from 'body-parser'
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";
import {blogsCollection, postsCollection, runDb, usersCollection} from "./repositories/db";
import {usersRouter} from "./routes/users-router";
import {authRouter} from "./routes/auth-router";

export const app = express()
const PORT = 3003

const middleWare = bodyParser({})


app.use(middleWare);
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)

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

