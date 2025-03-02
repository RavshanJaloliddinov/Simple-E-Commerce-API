import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Logger,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CategoryEntity } from "src/core/entity/category.entity";
import { Roles } from "src/common/database/Enums";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "../auth/users/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";

@ApiTags("Categories")
@ApiBearerAuth("access-token")
@Controller("categories")
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) { }

  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "List of all categories", type: [CategoryEntity] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllCategories(): Promise<CategoryEntity[]> {
    this.logger.log("Fetching all categories");
    return this.categoryService.findAll();
  }

  @ApiOperation({ summary: "Get category by ID" })
  @ApiResponse({ status: 200, description: "Category found", type: CategoryEntity })
  @ApiResponse({ status: 404, description: "Category not found" })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getCategoryById(@Param("id") id: string): Promise<CategoryEntity> {
    this.logger.log(`Fetching category with ID: ${id}`);
    const category = await this.categoryService.findOne(id);
    if (!category) {
      this.logger.warn(`Category with ID ${id} not found`);
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  @ApiOperation({ summary: "Create new category" })
  @ApiResponse({ status: 201, description: "Category created", type: CategoryEntity })
  @ApiResponse({ status: 409, description: "Category with this name already exists" })
  @RolesDecorator(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    this.logger.log("Creating new category");
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: "Update category" })
  @ApiResponse({ status: 200, description: "Category updated", type: CategoryEntity })
  @ApiResponse({ status: 404, description: "Category not found" })
  @RolesDecorator(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  async updateCategory(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    this.logger.log(`Updating category with ID: ${id}`);
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: "Delete category" })
  @ApiResponse({ status: 200, description: "Category deleted" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @RolesDecorator(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  async deleteCategory(@Param("id") id: string): Promise<void> {
    this.logger.log(`Deleting category with ID: ${id}`);
    return this.categoryService.remove(id)
  }
}
