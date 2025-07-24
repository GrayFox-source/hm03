export enum LikeStatus {
    none = 'None',
    like = 'Like',
    dislike = "Dislike",
}



export type LikeInputModel = {
    likeStatus: LikeStatus
}
