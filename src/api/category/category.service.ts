import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from 'src/core/entity/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const { name, parentId } = createCategoryDto;
    const category = new CategoryEntity();
    category.name = name;

    if (parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({ relations: ['parent', 'children'] });
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['parent', 'children'] });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    if (updateCategoryDto.name) category.name = updateCategoryDto.name;
    if (updateCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: updateCategoryDto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent;
    }
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
