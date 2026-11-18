import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @Matches(/^01[3-9]\d{8}$/, { message: "phone must be a valid Bangladeshi number like 01712345678" })
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  old_password!: string;

  @IsString()
  @MinLength(6)
  new_password!: string;
}
