// src/api/order/dto/update-order-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'confirmed', description: 'Buyurtma holati', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] })
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status: string;
}
