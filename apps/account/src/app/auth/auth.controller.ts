import {
  Body,
  Controller,
  Post,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dtos/login.dto'
import { RegisterDto } from './dtos/register.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    const { id } = await this.authService.validateUser(email, password)

    return this.authService.login(id)
  }
}
