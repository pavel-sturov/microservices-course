import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@microservices-course/contracts'
import {
  Body,
  Controller,
} from '@nestjs/common'
import {
  RMQRoute,
  RMQValidate,
} from 'nestjs-rmq'
import { UserService } from './user.service'

@Controller()
export class UserCommands {
  constructor(private readonly userService: UserService) {
  }

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  public async changeProfile(@Body() { user, id }: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
    return this.userService.changeProfile(user, id)
  }

  @RMQValidate()
  @RMQRoute(AccountBuyCourse.topic)
  public async buyCourse(@Body() { userId, courseId }: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
    return this.userService.buyCourse(userId, courseId)
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  public async checkPayment(@Body() { userId, courseId }: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment(userId, courseId)

  }
}
