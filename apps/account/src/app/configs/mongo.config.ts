import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config'
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose'

export const getMongoConfig = (): MongooseModuleAsyncOptions => ({
  useFactory: (configService: ConfigService) => ({
    uri: getMongoString(configService),
  }),
  inject:     [ConfigService],
  imports:    [ConfigModule],
})

const getMongoString = (configService: ConfigService) => {
  const x = `mongodb://${configService.get('MONGO_LOGIN')}:` +
    `${configService.get('MONGO_PASSWORD')}@` +
    `${configService.get('MONGO_HOST')}:` +
    `${configService.get('MONGO_PORT')}/` +
    `${configService.get('MONGO_DATABASE')}?authSource=` +
    `${configService.get('MONGO_AUTH_DATABASE')}`

  console.log(x)

  return x
}
