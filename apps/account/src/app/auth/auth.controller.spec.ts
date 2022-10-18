import {
  AccountLogin,
  AccountRegister,
} from '@microservices-course/contracts'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import {
  Test,
  TestingModule,
} from '@nestjs/testing'
import {
  RMQModule,
  RMQService,
  RMQTestService,
} from 'nestjs-rmq'
import { getMongoConfig } from '../configs/mongo.config'
import { UserRepository } from '../user/repositories/user.repository'
import { UserModule } from '../user/user.module'
import { AuthModule } from './auth.module'

const authLogin: AccountRegister.Request = {
  email:    'test@test.test',
  password: 'test',
}

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Test',
}

describe('Auth controller', () => {
  let app: INestApplication
  let userRepository: UserRepository
  let rmqService: RMQTestService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.env' }),
        RMQModule.forTest({}),
        UserModule,
        AuthModule,
        MongooseModule.forRootAsync(getMongoConfig()),
      ],
    }).compile()

    app            = module.createNestApplication()
    userRepository = app.get<UserRepository>(UserRepository)
    rmqService     = app.get(RMQService)

    await app.init()
  })

  it('Register', async () => {
    const response = await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
      AccountRegister.topic,
      authRegister,
    )

    expect(response.email).toEqual(authRegister.email)
  })

  it('Login', async () => {
    const response = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
      AccountLogin.topic,
      authLogin,
    )

    expect(response.access_token).toBeDefined()
  })

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email)
    await app.close()
  })
})
