import { BadRequestException, Injectable } from "@nestjs/common";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { MAX_UPLOAD_SIZE } from "@/common/constants/upload.constants";

@Injectable()
export class StorageService {
  save(file: Express.Multer.File, folder: string, allowedTypes: string[]) {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException("This file type is not allowed");
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new BadRequestException("File size must be less than 2 MB");
    }

    const dir = join(process.cwd(), "uploads", folder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const fileName = randomUUID() + extname(file.originalname).toLowerCase();
    writeFileSync(join(dir, fileName), file.buffer);

    return "uploads/" + folder + "/" + fileName;
  }
}
