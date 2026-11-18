import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Authservice } from "@/modules/auth/auth.service";
import { AuthDto, RegisterDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: Authservice) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() dto: AuthDto) {
    return await this.authService.signIn(dto);
  }
}
