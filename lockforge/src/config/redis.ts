import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

export function createRedisClient(): Redis {
    const url =process.env.REDIS_URL;

    if(!url){
        throw new Error("Redis Url isnt defined")

    }
    return new Redis(url);
}