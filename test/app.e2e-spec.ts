import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App as SupertestApp } from 'supertest/types';
import { AppModule } from './../src/app.module';

const toSupertestApp = (value: unknown): SupertestApp => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'function') {
    return value as SupertestApp;
  }
  if (
    value &&
    typeof value === 'object' &&
    'listen' in value &&
    typeof (value as { listen?: unknown }).listen === 'function'
  ) {
    return value as SupertestApp;
  }
  throw new Error('Invalid HTTP server');
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    const server = toSupertestApp(app.getHttpServer() as unknown);
    await request(server)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
