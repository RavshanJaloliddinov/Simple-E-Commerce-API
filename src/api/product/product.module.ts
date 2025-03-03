import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ProductEntity } from 'src/core/entity/product.entity';
import { UserEntity } from 'src/core/entity/user.entity';
import { FileService } from 'src/infrastructure/file/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, UserEntity]), MulterModule],
  controllers: [ProductController],
  providers: [ProductService, FileService],
})
export class ProductModule { }
