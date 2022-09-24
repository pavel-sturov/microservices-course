import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { getMongoConfig } from './configs/mongo.config'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.env' }),
    UserModule,
    AuthModule,
    MongooseModule.forRootAsync(getMongoConfig()),
  ],
})
export class AppModule {
}
