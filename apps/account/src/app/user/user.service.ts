import { IUser } from '@microservices-course/interfaces'
import { Injectable } from '@nestjs/common'
import { RMQService } from 'nestjs-rmq'
import { UserEntity } from './entities/user.entity'
import { UserRepository } from './repositories/user.repository'
import { BuyCourseSaga } from './sagas/buy-course.saga'
import { UserEventEmitter } from './user.event-emitter'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter,
  ) {
  }

  async changeProfile(user: Pick<IUser, 'displayName'>, id: string) {
    const candidate = await this.userRepository.findUserById(id)

    if (!candidate) {
      throw new Error('User is not found')
    }

    const userEntity = new UserEntity(candidate).updateProfile(user.displayName)

    await this.updateUser(userEntity)

    return {}
  }

  async buyCourse(userId: string, courseId: string) {
    const userEntity = await this.getUserEntity(userId)
    const saga       = new BuyCourseSaga(userEntity, courseId, this.rmqService)

    const { user, paymentLink } = await saga.getState().pay()

    await this.updateUser(user)

    return { paymentLink }
  }

  async checkPayment(userId: string, courseId: string) {
    const userEntity = await this.getUserEntity(userId)
    const saga       = new BuyCourseSaga(userEntity, courseId, this.rmqService)

    const { user, status } = await saga.getState().checkPayment()

    await this.updateUser(user)

    return { status }
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmitter.handle(user),
      this.userRepository.updateUser(user),
    ])
  }

  private async getUserEntity(userId: string) {
    const candidate = await this.userRepository.findUserById(userId)

    if (!candidate) {
      throw new Error('User is not exist')
    }

    return new UserEntity(candidate)
  }
}
