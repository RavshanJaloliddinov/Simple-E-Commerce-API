import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "src/core/entity/user.entity";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { is_deleted: false },
      relations: ['created_by', 'updated_by']
    });
  }

  async getAllDeletedUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { is_deleted: true },
      relations: ['created_by', 'updated_by']
    });
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['created_by', 'updated_by']
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto, createdBy: UserEntity): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, is_deleted: false },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      created_by: createdBy,
      updated_by: createdBy,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    return this.userRepository.save(newUser);
  }

  async updateUser(
    id: string,
    updateData: Partial<UserEntity>,
    updatedBy: UserEntity,
  ): Promise<UserEntity> {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (Object.keys(updateData).length === 0) {
      throw new ConflictException('No data provided for update.');
    }

    Object.assign(user, updateData);

    if (updatedBy) {
      user.updated_by = updatedBy;
    }
    user.updated_at = (Date.now());

    return this.userRepository.save(user);
  }


  async softDeleteUser(id: string, deletedBy: UserEntity): Promise<void> {
    const user = await this.getUserById(id);
    user.is_deleted = true;
    user.deleted_by = deletedBy;
    user.deleted_at = Date.now();
    await this.userRepository.save(user);
  }
}
