import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config';
import { BasketEntity, CategoryEntity, OrderEntity, ProductEntity, UserEntity } from 'src/core/entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { MailModule } from 'src/infrastructure/mail/mail.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { JwtStrategy } from './auth/users/AuthStrategy';
import { JwtAuthGuard } from './auth/users/AuthGuard';
import { APP_GUARD } from '@nestjs/core';

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
    ProductModule,
    CategoryModule,
    OrderModule,
    RedisModule,
    MailModule,
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ]
})
export class AppModule { }
 