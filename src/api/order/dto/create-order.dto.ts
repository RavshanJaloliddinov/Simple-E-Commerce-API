// src/api/order/dto/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'c51b5e08-0c85-4e22-8c53-1c3dd7ae7f94', description: 'Mahsulotning UUID' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2, description: 'Buyurtma soni' })
  @IsNotEmpty()
  quantity: number;
}
