import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import { User } from "./entities/user.entity";
import { ChangePasswordDto, UpdateProfileDto } from "./dto/user.dto";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUsers() {
    try {
      const users = await this.userRepository.find({ order: { created_at: "DESC" } });
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      if (!user) {
        throw new NotFoundException("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
        select: ["id", "name", "email", "password", "phone", "role", "is_active"],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUser(name: string, email: string, password: string, phone?: string) {
    try {
      const exists = await this.userRepository.findOne({ where: { email: email } });
      if (exists) {
        throw new ConflictException("This email is already registered");
      }
      const hash = await argon2.hash(password);
      const user = this.userRepository.create({
        name: name,
        email: email,
        password: hash,
        phone: phone,
        role: Role.CUSTOMER,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const saved = await this.userRepository.save(user);
      return await this.getUserById(saved.id);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    try {
      const user = await this.getUserById(id);
      if (dto.name) {
        user.name = dto.name;
      }
      if (dto.phone) {
        user.phone = dto.phone;
      }
      user.updated_at = new Date();
      await this.userRepository.save(user);
      return await this.getUserById(id);
    } catch (error) {
      throw error;
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        select: ["id", "password"],
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }
      const match = await argon2.verify(user.password, dto.old_password);
      if (!match) {
        throw new BadRequestException("Old password is wrong");
      }
      const hash = await argon2.hash(dto.new_password);
      await this.userRepository.update({ id: id }, { password: hash, updated_at: new Date() });
      return { message: "Password changed" };
    } catch (error) {
      throw error;
    }
  }

  async setRole(id: string, role: Role) {
    try {
      await this.userRepository.update({ id: id }, { role: role, updated_at: new Date() });
    } catch (error) {
      throw error;
    }
  }

  async setActive(id: string, isActive: boolean) {
    try {
      const user = await this.getUserById(id);
      user.is_active = isActive;
      user.updated_at = new Date();
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async countUsers() {
    try {
      return await this.userRepository.count();
    } catch (error) {
      throw error;
    }
  }
}
