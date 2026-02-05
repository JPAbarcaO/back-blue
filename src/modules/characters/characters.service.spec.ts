import { BadRequestException } from '@nestjs/common';
import { CharactersService } from './characters.service';

describe('CharactersService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('should reject invalid source', async () => {
    delete process.env.SUPERHERO_API_KEY;
    const characterModel = { updateOne: jest.fn() };
    const service = new CharactersService(characterModel as never);

    await expect(service.getRandomCharacter('superhero' as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should record like vote', async () => {
    const characterModel = { updateOne: jest.fn().mockResolvedValue({}) };
    const service = new CharactersService(characterModel as never);

    await expect(
      service.recordVote({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        vote: 'like',
      }),
    ).resolves.toEqual({ ok: true });

    expect(characterModel.updateOne).toHaveBeenCalledWith(
      { source: 'pokemon', externalId: '25' },
      expect.objectContaining({
        $inc: { likes: 1 },
      }),
      { upsert: true },
    );
  });

  it('should record dislike vote', async () => {
    const characterModel = { updateOne: jest.fn().mockResolvedValue({}) };
    const service = new CharactersService(characterModel as never);

    await expect(
      service.recordVote({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        vote: 'dislike',
      }),
    ).resolves.toEqual({ ok: true });

    expect(characterModel.updateOne).toHaveBeenCalledWith(
      { source: 'pokemon', externalId: '25' },
      expect.objectContaining({
        $inc: { dislikes: 1 },
      }),
      { upsert: true },
    );
  });

  it('should list characters with pagination', async () => {
    const items = [
      {
        source: 'pokemon',
        externalId: '25',
        name: 'Pikachu',
        imageUrl: 'img',
        likes: 2,
        dislikes: 1,
        lastEvaluatedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        source: 'rickandmorty',
        externalId: '1',
        name: 'Rick',
        imageUrl: null,
        likes: 0,
        dislikes: 0,
        lastEvaluatedAt: null,
      },
    ];
    const characterModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(items),
            }),
          }),
        }),
      }),
      countDocuments: jest.fn().mockResolvedValue(2),
    };
    const service = new CharactersService(characterModel as never);

    const result = await service.listCharacters({ limit: 2, skip: 0 });

    expect(result.total).toBe(2);
    expect(result.items).toEqual([
      {
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 2,
        dislikes: 1,
        lastEvaluatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        source: 'rickandmorty',
        sourceId: '1',
        name: 'Rick',
        image: '',
        likes: 0,
        dislikes: 0,
        lastEvaluatedAt: null,
      },
    ]);
  });

  it('should return top liked character', async () => {
    const item = {
      source: 'pokemon',
      externalId: '25',
      name: 'Pikachu',
      imageUrl: null,
      likes: 10,
      dislikes: 0,
      lastEvaluatedAt: null,
    };
    const characterModel = {
      findOne: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(item),
        }),
      }),
    };
    const service = new CharactersService(characterModel as never);

    await expect(service.getTopLikedCharacter()).resolves.toEqual({
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: '',
      likes: 10,
      dislikes: 0,
      lastEvaluatedAt: null,
    });
  });

  it('should return null when no top liked character', async () => {
    const characterModel = {
      findOne: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      }),
    };
    const service = new CharactersService(characterModel as never);

    await expect(service.getTopLikedCharacter()).resolves.toBeNull();
  });

  it('should call fetch + upsert for explicit source', async () => {
    const characterModel = { updateOne: jest.fn().mockResolvedValue({}) };
    const service = new CharactersService(characterModel as never);
    const serviceAny = service as unknown as {
      fetchBySource: (source: string) => Promise<unknown>;
      upsertCharacter: (character: unknown) => Promise<void>;
    };
    const fetchBySource = jest.spyOn(serviceAny, 'fetchBySource').mockResolvedValue({
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: 'img',
    });
    const upsertCharacter = jest.spyOn(serviceAny, 'upsertCharacter').mockResolvedValue();

    const result = await service.getRandomCharacter('pokemon');

    expect(result).toEqual({
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: 'img',
    });
    expect(fetchBySource).toHaveBeenCalledWith('pokemon');
    expect(upsertCharacter).toHaveBeenCalled();
  });
});
