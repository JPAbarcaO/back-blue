import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { Character, CharacterSchema } from './schemas/character.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Character.name,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = CharacterSchema;
          const collection = configService.get<string>('MONGO_COLLECTION') ?? 'characters';
          schema.set('collection', collection);
          return schema;
        },
      },
    ]),
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
})
export class CharactersModule {}
