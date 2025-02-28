import { HttpStatus, Injectable, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import * as express from "express";
import { AppModule } from './app.module';
import { config } from 'src/config';

@Injectable()
export class Application {
  public static async main(): Promise<void> {
    let app = await NestFactory.create(AppModule);
    // app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({
      origin: "*",
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    app.setGlobalPrefix("api");
    app.use("/images", express.static(join(__dirname, "../../../uploads")));


    await app.listen(config.PORT, () => {
      console.log(Date.now());
      console.log(`Server running on  ${config.PORT} port`);
    });
  }
}
