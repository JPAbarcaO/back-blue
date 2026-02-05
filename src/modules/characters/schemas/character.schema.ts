import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { CharacterSource } from '../dto/characters.dto';

export type CharacterDocument = HydratedDocument<Character>;

@Schema({ timestamps: true })
export class Character {
  @Prop({ type: String, required: true, enum: ['rickandmorty', 'pokemon', 'superhero', 'dragonball'] })
  source!: CharacterSource;

  @Prop({ required: true })
  externalId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, default: null })
  imageUrl!: string | null;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ default: 0 })
  dislikes!: number;

  @Prop({ type: Date, default: null })
  lastEvaluatedAt!: Date | null;

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

CharacterSchema.index({ source: 1, externalId: 1 }, { unique: true });
CharacterSchema.index({ likes: -1 });
CharacterSchema.index({ dislikes: -1 });
CharacterSchema.index({ lastEvaluatedAt: -1 });
CharacterSchema.index({ source: 1, name: 1 });
