import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModuleAsyncOptions } from "@nestjs/mongoose";

export const mongooseConnectOptions: MongooseModuleAsyncOptions = {
    imports: [ConfigModule.forRoot()],
    useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URI')
    }),
    inject: [ConfigService]
}
