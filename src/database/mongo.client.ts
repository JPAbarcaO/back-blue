import { Logger } from '@nestjs/common';
import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient: MongoClient | null = null;
const mongoLogger = new Logger('Mongo');

class MongoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MongoConfigError';
  }
}

function buildMongoUri(): string {
  const { MONGO_DB, MONGO_USER, MONGO_PASS, MONGO_URL } = process.env;

  const missing: string[] = [];
  if (!MONGO_USER) missing.push('MONGO_USER');
  if (!MONGO_PASS) missing.push('MONGO_PASS');
  if (!MONGO_URL) missing.push('MONGO_URL');

  if (missing.length > 0) {
    throw new MongoConfigError(
      [
        'Falta la configuracion de MongoDB.',
        `Variables faltantes: ${missing.join(', ')}.`,
        'Solucion: completa las variables en tu .env o en el entorno.',
      ].join(' '),
    );
  }

  const mongoUser = MONGO_USER as string;
  const mongoPass = MONGO_PASS as string;
  const mongoUrl = MONGO_URL as string;

  const credentials = `${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPass)}`;
  const host = mongoUrl;
  const protocol = 'mongodb+srv';
  const database = MONGO_DB ? `/${encodeURIComponent(MONGO_DB)}` : '/';

  const uri = `${protocol}://${credentials}@${host}${database}?appName=Cluster0`;
  logMongoUri(uri);
  return uri;
}

function logMongoUri(uri: string): void {
  const redacted = uri.replace(/\/\/([^:]+):[^@]+@/u, '//{user}:***@');
  mongoLogger.log(`URI generada: ${redacted}`);
}

export function getMongoClient(): MongoClient {
  if (!cachedClient) {
    const uri = buildMongoUri();
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }

  return cachedClient;
}

function formatMongoError(error: unknown): Error {
  if (error instanceof MongoConfigError) {
    return error;
  }

  const err = error as { name?: string; message?: string; code?: string; cause?: unknown };
  const cause = (err?.cause ?? err) as { code?: string; message?: string; name?: string };
  const code = cause?.code ?? err?.code;
  const name = err?.name ?? cause?.name;

  if (code === 'ENOTFOUND') {
    return new Error(
      [
        'No se pudo resolver el host de MongoDB (DNS).',
        'Revisa `MONGO_URL` y tu conexion a internet.',
        'Si usas MongoDB Atlas, copia exactamente el hostname del string de conexion.',
      ].join(' '),
      { cause: error },
    );
  }

  if (code === 'ECONNREFUSED') {
    return new Error(
      [
        'MongoDB rechazo la conexion (ECONNREFUSED).',
        'Verifica que el servidor este activo y que el puerto sea correcto.',
      ].join(' '),
      { cause: error },
    );
  }

  if (name === 'MongoServerSelectionError' || name === 'MongoNetworkError') {
    return new Error(
      [
        'No se pudo conectar con el servidor de MongoDB.',
        'Revisa `MONGO_URL`, credenciales, acceso de red y que el cluster este disponible.',
        err?.message ? `Detalle: ${err.message}` : '',
      ]
        .filter(Boolean)
        .join(' '),
      { cause: error },
    );
  }

  return new Error(
    [
      'Error inesperado al conectar con MongoDB.',
      err?.message ? `Detalle: ${err.message}` : '',
    ]
      .filter(Boolean)
      .join(' '),
    { cause: error },
  );
}

export async function pingMongo(): Promise<void> {
  let client: MongoClient | null = null;

  try {
    client = getMongoClient();
    await client.connect();
    await client.db('admin').command({ ping: 1 });
  } catch (error) {
    throw formatMongoError(error);
  } finally {
    if (client) {
      await client.close().catch(() => undefined);
    }
    cachedClient = null;
  }
}
