export interface AnalysticsResponse {
    totalURLs?: number,
    totalClicks: number,
    uniqueClicks: number,
    clicksByDate: {
        date: string,
        clickCount: number
    }[],
    osType: {
        osName: string,
        uniqueClicks: number,
        uniqueUsers: number
    }[],
    deviceType: {
        deviceName: string,
        uniqueClicks: number,
        uniqueUsers: number
    }[]
}