import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = UserSchema;
          const collection =
            configService.get<string>('MONGO_USERS_COLLECTION') ?? 'users';
          schema.set('collection', collection);
          return schema;
        },
      },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
