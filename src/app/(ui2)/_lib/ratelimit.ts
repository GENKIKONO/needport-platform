import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
let rl: any = null;
try{
  if(url && token){
    rl = new Ratelimit({ redis: Redis.fromEnv?.() || new Redis(url), limiter: Ratelimit.slidingWindow(60, "1 m") });
  }
}catch{}

export async function limit(key: string){
  if(!rl) return { success: true, remaining: 999 };
  return rl.limit(key);
}
