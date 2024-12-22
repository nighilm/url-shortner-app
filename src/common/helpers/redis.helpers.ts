import { RedisCacheNames } from "../enum/cacheTypes.enum"

/**
 * Function to generate key to fetch short url data from redis cache
 * @param alias 
 * @returns cache key
 */
export const generateRedisCacheKey = (alias: string, baseKey: RedisCacheNames): string => {
    return `${baseKey}:${alias}`
}