import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config';
import { BasketEntity, CategoryEntity, OrderEntity, ProductEntity, UserEntity } from 'src/core/entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URL,
      synchronize: true,
      entities: [UserEntity, CategoryEntity, ProductEntity, BasketEntity, OrderEntity],
      ssl: false
    }),
    AuthModule,
    UserModule,
  ]
})
export class AppModule { }
