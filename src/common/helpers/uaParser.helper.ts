import { UAParser } from "ua-parser-js"
import { RequestParseData } from "../interfaces/requestParse.interface";

/**
 * Function to return device type and os type parsed from request
 * @param userAgent 
 * @returns deviceType, osType
 */
export const parseDataFromRequest = (userAgent: string): RequestParseData => {
    let parser: UAParser = new UAParser(userAgent)
    let { device, os } = parser.getResult();
    return {
        deviceType: device.type === undefined ? "Desktop" : device.type,
        osType: os?.name
    }
}