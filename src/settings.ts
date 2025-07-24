export const settings = {
    JWT_ACCESS_SECRET: process.env.JWT_SECRET || '123',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '456',
    MONGO_URI: process.env.MONGO_URI || '\'mongodb://localhost:27017\'',
    JWT_RECOVERY_SECRET: process.env.JWT_RECOVERY_SECRET || '513'
}