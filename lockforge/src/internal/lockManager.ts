import type {Redis} from "ioredis" 
import type {LockResult,LockInfo} from "./types.js"

export async function acquireLock(
    redis:Redis,
    resource:string,
    owner:string,
    ttl:number,
): Promise<LockResult> {

    const key = "lock:"+resource;
    const result=await redis.set(key,owner, "NX" ,"PX",ttl)

    if(result==="OK"){
        return {locked:true,resource,owner,ttl}
    } 
    else if (result===null){
        const currOwner= await redis.get(key)
        const remainingTTL= await redis.pttl(key)

        return {
            locked:false,
            resource,
            retry_after_ms:remainingTTL,
            message:`Currently taken by ${currOwner}`
        }
    }



}

export async function  releaseLock(
    redis:Redis,
    resource:string,
    owner:string,
      ) :Promise<LockResult> {
         const luaScript = `if redis.call("GET", KEYS[1]) == ARGV[1] then
                      return redis.call("DEL", KEYS[1])
                    else
                     return 0
                    end`

                 const key = "lock:" +resource;
                 const result = await redis.eval(luaScript,1,key,owner)

if(result ===1){

    return {
    locked:false,
    resource,
    message:"Success"
    }
}

else if (result ===0){
    const res= await redis.get(key)
    if(res===null){
        return {
            locked:false,
            resource,
            message:"Resource wasnt locked"
        }
    }
    else if (res){
        return {
            locked:false,
            resource,
            message:"Owned by someone else "
        }
    }
}

}

export async function checkLock(
    redis:Redis,
    resource:string
): Promise<LockInfo | null > {

    const key = "lock:" +resource;
    const result =await redis.get(key)
    if(result===null){
       return  null;
        
    }
    else if (result){
        const ttl_remaining =await redis.pttl(key)
        return {
            resource,
            owner:result,
            ttl_remaining
        }
    }

}