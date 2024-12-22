export interface AnalysticsResponse {
    totalClicks: number,
    uniqueClicks: number,
    clicksByDate: {
        date: string,
        clickCount: number
    }[],
}

export interface AnalysticsAliasResponse extends AnalysticsResponse {
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

export interface AnalysticsTopicResponse extends AnalysticsResponse {
    urls: {
        totalClicks: number,
        shortURL: string,
        uniqueClicks: number
    }[]
}

export interface AnalysticsOverallResponse extends AnalysticsAliasResponse {
    totalURLs: number
}
