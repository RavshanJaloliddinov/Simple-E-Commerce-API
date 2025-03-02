import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from 'src/core/entity/product.entity';
import { UserEntity } from 'src/core/entity/user.entity';
import { FileService } from 'src/infrastructure/file/file.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly fileService: FileService
  ) { }

  // Create
  async create(createProductDto: CreateProductDto, file: Express.Multer.File, user: UserEntity) {
    const imagePath = await this.fileService.saveFile(file);
    const product = this.productRepository.create({
      ...createProductDto,
      image: imagePath,
      created_by: user
    });
    return this.productRepository.save(product);
  }

  // Get all products
  async findAll() {
    return this.productRepository.find({ where: { is_deleted: false } });
  }

  // Get product by ID
  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Update product
  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File, user?: UserEntity) {
    const product = await this.findOne(id);

    if (file) {
      const imagePath = await this.fileService.saveFile(file);
      product.image = imagePath;
      product.updated_at = Date.now()
      product.updated_by = user
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  // Delete product
  async remove(id: string, user: UserEntity) {
    const product = await this.findOne(id);
    product.is_deleted = true
    product.deleted_at = Date.now()
    product.deleted_by = user
    await this.productRepository.save(product)
    return product;
  }
}
