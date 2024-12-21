/**
 * Function to generate key to fetch short url data from redis cache
 * @param alias 
 * @returns cache key
 */
export const generateShortURLCacheKey = (alias: string): string => {
    return `short-url:${alias}`
}