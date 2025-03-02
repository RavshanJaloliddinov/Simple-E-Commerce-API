// src/modules/product/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ProductStatus } from 'src/common/database/Enums';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    stock?: number;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}
