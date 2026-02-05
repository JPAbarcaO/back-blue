import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

describe('CharactersController', () => {
  it('should get random character', async () => {
    const charactersService = {
      getRandomCharacter: jest.fn().mockResolvedValue({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
      }),
    } as unknown as CharactersService;
    const controller = new CharactersController(charactersService);

    await expect(controller.getRandom({ source: 'pokemon' })).resolves.toEqual({
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: 'img',
    });
    expect(charactersService.getRandomCharacter).toHaveBeenCalledWith('pokemon');
  });

  it('should list characters', async () => {
    const charactersService = {
      listCharacters: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        limit: 20,
        skip: 0,
      }),
    } as unknown as CharactersService;
    const controller = new CharactersController(charactersService);

    await expect(controller.listCharacters({ limit: 20, skip: 0 })).resolves.toEqual({
      items: [],
      total: 0,
      limit: 20,
      skip: 0,
    });
  });

  it('should return top liked character', async () => {
    const charactersService = {
      getTopLikedCharacter: jest.fn().mockResolvedValue({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 10,
        dislikes: 0,
        lastEvaluatedAt: null,
      }),
    } as unknown as CharactersService;
    const controller = new CharactersController(charactersService);

    await expect(controller.topLike()).resolves.toEqual({
      item: {
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 10,
        dislikes: 0,
        lastEvaluatedAt: null,
      },
    });
  });

  it('should return top disliked character', async () => {
    const charactersService = {
      getTopDislikedCharacter: jest.fn().mockResolvedValue({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 0,
        dislikes: 10,
        lastEvaluatedAt: null,
      }),
    } as unknown as CharactersService;
    const controller = new CharactersController(charactersService);

    await expect(controller.topDislike()).resolves.toEqual({
      item: {
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 0,
        dislikes: 10,
        lastEvaluatedAt: null,
      },
    });
  });

  it('should return last evaluated character', async () => {
    const charactersService = {
      getLastEvaluatedCharacter: jest.fn().mockResolvedValue({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 0,
        dislikes: 0,
        lastEvaluatedAt: '2024-01-01T00:00:00.000Z',
      }),
    } as unknown as CharactersService;
    const controller = new CharactersController(charactersService);

    await expect(controller.lastEvaluated()).resolves.toEqual({
      item: {
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        likes: 0,
        dislikes: 0,
        lastEvaluatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('should record vote', async () => {
    const charactersService = {
      recordVote: jest.fn().mockResolvedValue({ ok: true }),
    } as unknown as CharactersService;
    const controller = new CharactersController(charactersService);

    await expect(
      controller.vote({
        source: 'pokemon',
        sourceId: '25',
        name: 'Pikachu',
        image: 'img',
        vote: 'like',
      }),
    ).resolves.toEqual({ ok: true });

    expect(charactersService.recordVote).toHaveBeenCalled();
  });
});
