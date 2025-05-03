import express, {Request, Response} from 'express';
import bodyParser from 'body-parser'
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";
import {blogsCollection, postsCollection, runDb} from "./repositories/db";

const app = express()
const PORT = 3003

const middleWare = bodyParser({})


app.use(middleWare);
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)

app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({})
    await postsCollection.deleteMany({})
    res.send(204)
})

const startApp = async () => {
    await runDb()
    app.listen(PORT,() => {
        console.log(`Server working on port ${PORT}`)
    })
}

startApp()

