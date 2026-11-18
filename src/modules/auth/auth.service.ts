import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { UserService } from "@/modules/user/user.service";
import { AuthDto, RegisterDto } from "./dto/auth.dto";
import { User } from "../user/entities/user.entity";
import { appConfig } from "@/src/config";

@Injectable()
export class Authservice {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.userService.createUser(dto.name, dto.email, dto.password, dto.phone);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    try {
      const user = await this.userService.findOneByEmail(dto.email);
      if (!user) {
        throw new UnauthorizedException("Invalid email or password");
      }
      const match = await argon2.verify(user.password, dto.password);
      if (!match) {
        throw new UnauthorizedException("Invalid email or password");
      }
      if (!user.is_active) {
        throw new ForbiddenException("Your account is deactivated");
      }
      const tokens = await this.signTokens(user);
      return {
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async signTokens(user: User) {
    const expires_in = Date.now() + 1000 * 60 * 60 * 24 * 30;
    const accessPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: [user.role],
    };
    const refreshPayload = {
      id: user.id,
    };

    const access_token = await this.jwt.signAsync(accessPayload, {
      expiresIn: "30d",
      secret: appConfig.env.JWT_BEARER_SECRET,
    });
    const refresh_token = await this.jwt.signAsync(refreshPayload, {
      expiresIn: "30d",
      secret: appConfig.env.JWT_REFRESH_SECRET,
    });

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: expires_in,
    };
  }
}
