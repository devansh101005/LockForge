export interface LockRequest {
owner: string;
ttl?: number;
}

export interface LockResult {  //can be used for Acquire Success , Acquire failure and Release Success
    locked:boolean;
    resource:string;
    owner?: string;
    ttl?: number;
    retry_after_ms?: number;
    message?:string;
}

export interface LockInfo {
    resource: string;
    owner:string;
    ttl_remaining:number;
}