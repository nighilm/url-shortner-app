import { ConfigModuleOptions } from "@nestjs/config";

export const envFileConfigOptions: ConfigModuleOptions = {
    isGlobal: true,
    envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`
}