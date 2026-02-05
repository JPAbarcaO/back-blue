# ms-blue

Backend en NestJS con MongoDB y JWT.

**Resumen**
- API base con NestJS.
- Conexion a MongoDB Atlas usando Mongoose.
- Seguridad con JWT (sin OAuth2 en este momento).
- Documentacion Swagger en `/docs`.

**Lo Ultimo Instalado / Agregado**
- Mongoose y `@nestjs/mongoose` para la conexion a MongoDB.
- Swagger (`@nestjs/swagger` + `swagger-ui-express`) para documentar la API.
- Rate limit global y logs de requests.
- Integracion con 4 APIs externas (Rick and Morty, Pokemon, Superhero, Dragon Ball).

**Requisitos (Paso a Paso)**
- Node.js 20+ (recomendado 22).
- npm 9+ (se instala con Node.js).
- Cuenta de MongoDB Atlas o un cluster accesible.
- (Opcional) NestJS CLI si quieres usar comandos `nest`, pero para correr este proyecto **no es obligatorio**.
- (Opcional) Git si vas a clonar el proyecto desde un repositorio.
- No necesitas instalar MongoDB en tu PC (la base puede estar en Atlas).
- Compatible con Windows, macOS y Linux.

**Checklist Rapida**
- `node -v` muestra version 20 o superior.
- `npm -v` muestra version 9 o superior.
- Existe un archivo `.env` en la raiz del proyecto (al lado de `package.json`).
- Tienes usuario y password de MongoDB Atlas o una conexion que ya te entregaron.
- Conoces el host correcto de Atlas (`cluster0.xxxxx.mongodb.net`).
- Para usar endpoints protegidos (`/api/v1/characters` y `/api/v1/auth/me`), primero debes registrarte y hacer login para obtener un token.
- Para usar Superhero, agrega `SUPERHERO_API_KEY` en el `.env`.
- Base URL local de la API: `http://localhost:3000/api/v1`.

**Paso a Paso**
1. Instala Node.js (esto tambien instala npm).
   Si ya tienes Node.js 20+ y npm 9+, puedes saltar este paso.
   Video recomendado (Node.js + NestJS): `https://www.youtube.com/watch?v=8xJE99tsPn0`
   Video apoyo (NestJS + MongoDB + Mongoose): `https://www.youtube.com/watch?v=K7TYj86Z3rY`
   Para verificar la instalacion en Windows, macOS o Linux, abre una terminal y ejecuta:
```
bash
node -v
npm -v
```
2. (Opcional) Instala NestJS CLI si quieres usar comandos `nest`:
```
bash
npm i -g @nestjs/cli
```
3. Descarga el proyecto y abre una terminal en la carpeta del proyecto.
   Si tienes Git, clona el repo y entra a la carpeta:
```
bash
git clone https://github.com/JPAbarcaO/back-blue
cd back-blue
```
   Si no tienes Git, descarga el ZIP desde GitHub, descomprimelo y entra a la carpeta (normalmente `back-blue`).
   En Windows puedes usar PowerShell o CMD. En macOS y Linux usa Terminal.
4. Instala dependencias del proyecto (esto instala NestJS, Mongoose y Swagger automaticamente).
```
bash
npm install
```
5. Si te entregaron el archivo `.env`, colocalo en la raiz del proyecto y salta al paso 7.
   Si no lo tienes, crea un archivo llamado `.env` en la raiz (mismo nivel que `package.json`).
   En Windows verifica que no sea `.env.txt`.
6. Copia y completa esta configuracion basica (reemplaza los valores de ejemplo) en tu `.env`.
   Si aun no tienes Atlas, ve a la seccion "MongoDB Atlas (Configuracion Recomendada)" y vuelve aqui.
```
env
PORT=3000

MONGO_URL=cluster0.sm4s02l.mongodb.net
MONGO_USER=root_be
MONGO_PASS=tu_password_aqui
MONGO_DB=be_test
MONGO_COLLECTION=characters

JWT_SECRET=un_secreto_largo_y_unico
JWT_EXPIRES_IN=1h

BCRYPT_SALT_ROUNDS=10
HASH=BX

RICK_AND_MORTY_API_BASE=https://rickandmortyapi.com/api
POKEMON_API_BASE=https://pokeapi.co/api/v2
SUPERHERO_API_BASE=https://superheroapi.com/api
DRAGONBALL_API_BASE=https://dragonball-api.com/api
DRAGONBALL_MAX_ID=58
# SUPERHERO_API_KEY=tu_api_key
# SUPERHERO_MAX_ID=731

RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=60

CORS_ORIGIN=http://localhost:3000
```
7. Inicia el proyecto.
```
bash
npm run start
```
8. Debes ver en consola:
   “MongoDB conectado correctamente.”
   “App escuchando en el puerto 3000.”
   Si ves errores, revisa la seccion "Soluciones Comunes".
9. Swagger disponible en `http://localhost:3000/docs`.
10. (Opcional) Prueba los endpoints desde Swagger o con `curl` (ver seccion JWT).
    Recuerda: `random` y `vote` son publicos; `list` y `me` requieren token.
    Base URL local de la API: `http://localhost:3000/api/v1`.

**Uso Paso a Paso**
1. Registrar usuario (crea usuario, no devuelve token):
```
bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@local","password":"super-seguro-123","name":"Demo"}'
```
2. Login (aqui se obtiene el JWT):
```
bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@local","password":"super-seguro-123"}'
```
3. Guardar el token y usarlo en los siguientes pasos.
4. Obtener un personaje aleatorio (sin token, rate limit 30/min):
```
bash
curl "http://localhost:3000/api/v1/characters/random?source=pokemon"
```
5. Votar like/dislike (sin token, rate limit 30/min):
```
bash
curl -X POST http://localhost:3000/api/v1/characters/vote \
  -H "Content-Type: application/json" \
  -d '{"source":"pokemon","sourceId":"25","name":"Pikachu","image":"https://img","vote":"like"}'
```
6. Listar personajes guardados (requiere token):
```
bash
curl -H "Authorization: Bearer <tu_token>" "http://localhost:3000/api/v1/characters?sortBy=likes&order=desc&limit=20&skip=0"
```
7. Consultas rapidas (requieren token):
```
bash
curl -H "Authorization: Bearer <tu_token>" http://localhost:3000/api/v1/characters/top-like
```
```
bash
curl -H "Authorization: Bearer <tu_token>" http://localhost:3000/api/v1/characters/top-dislike
```
```
bash
curl -H "Authorization: Bearer <tu_token>" http://localhost:3000/api/v1/characters/last-evaluated
```
8. Abrir Swagger para probar sin consola:
   `http://localhost:3000/docs`

**Soluciones Comunes**
- "MongoDB conectado correctamente." no aparece:
  revisa `MONGO_URL`, `MONGO_USER`, `MONGO_PASS` y que tu IP este permitida en Atlas.
- `ENOTFOUND` o DNS:
  verifica que `MONGO_URL` sea solo el host (sin `mongodb+srv://`).
- `authentication failed`:
  usuario o password incorrectos en Atlas.
- `Falta JWT_SECRET`:
  agrega `JWT_SECRET` en el `.env`.
- `Cannot determine a type` (Mongoose):
  revisa que los campos con `null` tengan `@Prop({ type: ... })`.
- `Rate limit exceeded`:
  sube temporalmente `RATE_LIMIT_LIMIT` en el `.env`.

**Material de apoyo**
- Documentacion oficial NestJS + MongoDB (Mongoose): `https://docs.nestjs.com/techniques/mongodb`
- Configuracion de CORS (opciones): `https://github.com/expressjs/cors#configuration-options`

**Notas de Configuracion**
- `MONGO_URL` es solo el host (sin `mongodb://` ni `mongodb+srv://`).
- `MONGO_USER` y `MONGO_PASS` deben existir en MongoDB Atlas.
- `MONGO_DB` es la base de datos y `MONGO_COLLECTION` es la coleccion a usar.
- `JWT_SECRET` es obligatorio. Si falta, la app fallara al iniciar.
- `JWT_EXPIRES_IN` acepta valores como `1h`, `15m` o un numero en segundos.
- `BCRYPT_SALT_ROUNDS` controla el hash de passwords (por defecto 10).
- `HASH` se concatena con la clave del usuario antes de generar el hash (ej: `BX:password`).
- La conexion a MongoDB se hace con Mongoose y usa estas variables de entorno.
- Puedes personalizar las rutas de las APIs externas con:
  `RICK_AND_MORTY_API_BASE`, `POKEMON_API_BASE`, `SUPERHERO_API_BASE`, `DRAGONBALL_API_BASE`.
- Dragon Ball usa `DRAGONBALL_MAX_ID` (por defecto 58).
- Rate limit global:
  `RATE_LIMIT_TTL` (segundos) y `RATE_LIMIT_LIMIT` (peticiones).
- CORS (local):
  `CORS_ORIGIN` acepta uno o varios origenes separados por coma.

**Carpeta `src/config`**
La configuracion centralizada del proyecto vive aqui:
- `src/config/app.constants.ts`: prefijo global de rutas.
- `src/config/mongo.config.ts`: construccion de URI de MongoDB.
- `src/config/throttler.config.ts`: rate limit global.
- `src/config/cors.config.ts`: CORS desde variables de entorno.
- `src/config/swagger.config.ts`: configuracion de Swagger.

**APIs Externas (Rutas y Campos)**
- Rick and Morty (detalle): `GET ${RICK_AND_MORTY_API_BASE}/character/{id}`.
- Rick and Morty (campos usados): `id` -> `externalId`, `name`, `image`.
- Rick and Morty (total): `GET ${RICK_AND_MORTY_API_BASE}/character`.
- Rick and Morty (total usado): `info.count`.
- Rick and Morty docs: `https://rickandmortyapi.com/documentation`.
- Pokemon (detalle): `GET ${POKEMON_API_BASE}/pokemon/{id}`.
- Pokemon (campos usados): `id` -> `externalId`, `name`, `sprites.other['official-artwork'].front_default` o `sprites.front_default` -> `image`.
- Pokemon (total): `GET ${POKEMON_API_BASE}/pokemon?limit=1`.
- Pokemon (total usado): `count`.
- Pokemon docs: `https://pokeapi.co/docs/v2`.
- Superhero (detalle): `GET ${SUPERHERO_API_BASE}/{API_KEY}/{id}`.
- Superhero (campos usados): `id` -> `externalId`, `name`, `image.url` -> `image`.
- Superhero docs: `https://superheroapi.com/index.html`.
- Dragon Ball (detalle): `GET ${DRAGONBALL_API_BASE}/characters/{id}`.
- Dragon Ball (campos usados): `id` -> `externalId`, `name`, `image`.
- Dragon Ball (maximo): `DRAGONBALL_MAX_ID=58` (la API tiene 58 personajes).
- Dragon Ball (transformaciones): la lista incluye hasta 43 transformaciones (no se usan en este proyecto).
- Dragon Ball docs: `https://web.dragonball-api.com/documentation`.

**MongoDB Atlas (Configuracion Recomendada)**
Si no tienes base de datos propia, puedes crearla gratis en MongoDB Atlas (capa gratuita). Web: `https://www.mongodb.com/atlas`.
1. Registrate en la web de MongoDB Atlas y crea un cluster de la capa gratuita.
2. Crea un usuario de base de datos (usuario y clave). Puedes usar el que te entrega Atlas o configurar uno propio.
3. Configura el acceso de red (IP Allowlist) para permitir tu IP actual o `0.0.0.0/0` si estas en desarrollo y sabes lo que implica.
4. Crea la base de datos y la coleccion (usa los valores de `MONGO_DB` y `MONGO_COLLECTION`).
5. Crea los indices en la coleccion (tab `Indexes`), tal como en la imagen.
6. Inserta un documento inicial (Pikachu) para asegurar que la coleccion exista.
7. Sigue los pasos de la pagina de Atlas para obtener los datos de conexion y usa esos valores en el `.env` (o utiliza la conexion que te hayan proporcionado).

Indices requeridos:
- `_id_` (creado automaticamente, `unique`).
- `source_1_externalId_1` (compuesto, `unique` sobre `source` + `externalId`).
- `likes_-1` (descendente).
- `dislikes_-1` (descendente).
- `lastEvaluatedAt_-1` (descendente).
- `source_1_name_1` (compuesto sobre `source` + `name`).

Ejemplo de documento (tab `Documents` -> `ADD DATA`):
```
json
{
  "source": "pokemon",
  "externalId": "25",
  "name": "Pikachu",
  "imageUrl": null,
  "likes": 0,
  "dislikes": 0,
  "lastEvaluatedAt": null,
  "payload": {}
}
```

**Usuarios (MongoDB Atlas)**
Lo que debes hacer manualmente en Atlas:
1. Crear la coleccion `users` en `MONGO_DB`.
2. Crear un indice unico para `email` (campo `email`, orden `1`, `unique = true`).

Lo que se crea automaticamente cuando se registra el primer usuario:
- `_id` (automatico por MongoDB).
- `email` (correo, debe ser unico).
- `passwordHash` (hash de la clave, **no** guardes la clave en texto plano).
- `name` (nombre del usuario, opcional).
- `createdAt` / `updatedAt` (timestamps automáticos de Mongoose).

Indice requerido:
- `email_1` con `unique = true`.

Ejemplo de documento (solo referencia, el sistema lo crea con hash):
```
json
{
  "email": "demo@local",
  "passwordHash": "$2b$10$...",
  "name": "Demo",
  "createdAt": "2026-02-03T22:30:00.000Z",
  "updatedAt": "2026-02-03T22:30:00.000Z"
}
```

Nota sobre reinicio de clave:
- El botón de "reiniciar clave" en el front actualizará el `passwordHash` a una clave basica definida por el equipo y comunicada al usuario.

**Notas de Conexion (Atlas)**
- `MONGO_URL` es solo el host (sin `mongodb://` ni `mongodb+srv://`). Ejemplo: `cluster0.xxxxx.mongodb.net`
- `MONGO_USER` y `MONGO_PASS` deben corresponder al usuario creado en Atlas.
- Si alguien ya te entrego las variables del `.env`, solo completa esos valores y podras conectarte.

Como obtener el host correcto:
- En Atlas, ve a `Database` -> tu cluster -> `Connect` -> `Drivers`.
- Copia el connection string (por ejemplo: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`).
- El host para `MONGO_URL` es la parte despues de `@` y antes de `/` (ejemplo: `cluster0.xxxxx.mongodb.net`).

**Comandos Utiles**
```
bash
# desarrollo
npm run start:dev

# tests
npm run test
```

**JWT (Uso Basico)**
- El JWT se obtiene desde `POST /api/v1/auth/login` (el registro solo crea el usuario).
- `GET /api/v1/characters/random` y `POST /api/v1/characters/vote` son publicos (limitados a 30 req/min).
- `GET /api/v1/characters`, `GET /api/v1/auth/me` requieren token JWT valido.

Ejemplo de registro:
```
bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@local","password":"super-seguro-123","name":"Demo"}'
```
```
powershell
curl -Method Post http://localhost:3000/api/v1/auth/register `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"demo@local","password":"super-seguro-123","name":"Demo"}'
```

Ejemplo de login:
```
bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@local","password":"super-seguro-123"}'
```
```
powershell
curl -Method Post http://localhost:3000/api/v1/auth/login `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"demo@local","password":"super-seguro-123"}'
```

Ejemplos de llamadas con token:
```
bash
curl -H "Authorization: Bearer <tu_token>" http://localhost:3000/api/v1/auth/me
```
```
powershell
curl -Headers @{ "Authorization" = "Bearer <tu_token>" } http://localhost:3000/api/v1/auth/me
```
```
bash
curl "http://localhost:3000/api/v1/characters/random?source=pokemon"
```
```
powershell
curl "http://localhost:3000/api/v1/characters/random?source=pokemon"
```
```
bash
curl -X POST http://localhost:3000/api/v1/characters/vote \
  -H "Content-Type: application/json" \
  -d '{"source":"pokemon","sourceId":"25","name":"Pikachu","image":"https://img","vote":"like"}'
```
```
powershell
curl -Method Post http://localhost:3000/api/v1/characters/vote `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"source":"pokemon","sourceId":"25","name":"Pikachu","image":"https://img","vote":"like"}'
```

**Errores Comunes**
- `ENOTFOUND` o DNS: revisa `MONGO_URL` y tu conexion.
- `authentication failed`: revisa usuario/password en Atlas.
- `Falta JWT_SECRET`: agrega la variable en `.env`.
