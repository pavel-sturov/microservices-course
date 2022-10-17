import { AccountRegister } from '@microservices-course/contracts'
import { UserRole } from '@microservices-course/interfaces'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserEntity } from '../user/entities/user.entity'
import { UserRepository } from '../user/repositories/user.repository'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
  }

  async register({ email, password, displayName }: AccountRegister.Request) {
    const candidate = await this.userRepository.findUser(email)

    if (candidate) {
      throw new Error('User is already registered')
    }

    const newUserEntity = await new UserEntity({
      displayName,
      email,
      passwordHash: '',
      role:         UserRole.Student,
    }).setPassword(password)

    const newUser = await this.userRepository.createUser(newUserEntity)

    return { email: newUser.email }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findUser(email)

    if (!user) {
      throw new Error('Login or password is invalid')
    }

    const userEntity        = new UserEntity(user)
    const isCorrectPassword = await userEntity.validatePassword(password)
    if (!isCorrectPassword) {
      throw new Error('Login or password is invalid')
    }

    return { id: user._id }
  }

  async login(id: string) {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    }
  }
}
