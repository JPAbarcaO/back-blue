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

**Requisitos (For Dummies)**
- Node.js 20+ (recomendado 22).
- npm 9+ (se instala con Node.js).
- Cuenta de MongoDB Atlas o un cluster accesible.
- (Opcional) NestJS CLI si quieres usar comandos `nest`, pero para correr este proyecto **no es obligatorio**.
- (Opcional) Git si vas a clonar el proyecto desde un repositorio.
- No necesitas instalar MongoDB en tu PC (la base puede estar en Atlas).
- Compatible con Windows, macOS y Linux.

**Paso a Paso (For Dummies)**
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
3. Descarga el proyecto y abre una terminal en la carpeta `ms-blue`.
   Si tienes un ZIP, descomprimelo y entra a la carpeta del proyecto.
   En Windows puedes usar PowerShell o CMD. En macOS y Linux usa Terminal.
4. Instala dependencias del proyecto (esto instala NestJS, Mongoose y Swagger automaticamente).
```
bash
npm install
```
5. Crea tu archivo `.env` en la raiz del proyecto.
6. Copia y completa esta configuracion basica (reemplaza los valores de ejemplo).
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
```
7. Inicia el proyecto.
```
bash
npm run start
```
8. Debes ver en consola:
   “MongoDB conectado correctamente.”
   “App escuchando en el puerto 3000.”
9. Swagger disponible en `http://localhost:3000/docs`.
10. (Opcional) Prueba los endpoints desde Swagger o con `curl` (ver seccion JWT).

**Notas de Configuracion**
- `MONGO_URL` es solo el host (sin `mongodb://` ni `mongodb+srv://`).
- `MONGO_USER` y `MONGO_PASS` deben existir en MongoDB Atlas.
- `MONGO_DB` es la base de datos y `MONGO_COLLECTION` es la coleccion a usar.
- `JWT_SECRET` es obligatorio. Si falta, la app fallara al iniciar.
- `JWT_EXPIRES_IN` acepta valores como `1h`, `15m` o un numero en segundos.
- La conexion a MongoDB se hace con Mongoose y usa estas variables de entorno.

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

**Notas de Conexion (Atlas)**
- `MONGO_URL` es solo el host (sin `mongodb://` ni `mongodb+srv://`). Ejemplo: `cluster0.xxxxx.mongodb.net`
- `MONGO_USER` y `MONGO_PASS` deben corresponder al usuario creado en Atlas.
- Si alguien ya te entrego las variables del `.env`, solo completa esos valores y podras conectarte.

Como obtener el host correcto:
- En Atlas, ve a `Database` -> tu cluster -> `Connect` -> `Drivers`.
- Copia el connection string (por ejemplo: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`).
- El host para `MONGO_URL` es la parte despues de `@` y antes de `/` (ejemplo: `cluster0.xxxxx.mongodb.net`).

Seed de Pikachu (opciones):
- Desde Atlas UI: tab `Documents` -> `ADD DATA` -> pega el JSON del ejemplo de abajo.
- Desde `mongosh` (si lo usas localmente):
```
bash
mongosh "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<db>"
```
```
javascript
use <db>
db.<collection>.insertOne({
  source: "pokemon",
  externalId: "25",
  name: "Pikachu",
  imageUrl: null,
  likes: 0,
  dislikes: 0,
  lastEvaluatedAt: null,
  payload: {}
})
```

**Comandos Utiles**
```
bash
# desarrollo
npm run start:dev

# tests
npm run test
```

**JWT (Uso Basico)**
- Puedes obtener un JWT desde `POST /auth/token` enviando al menos `sub` o `userId`.
- Los endpoints de `characters` y `GET /auth/me` requieren un token JWT valido.

Ejemplo para obtener token:
```
bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"sub":"demo-user","email":"demo@local","name":"Demo"}'
```
```
powershell
curl -Method Post http://localhost:3000/auth/token `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"sub":"demo-user","email":"demo@local","name":"Demo"}'
```

Ejemplos de llamadas con token:
```
bash
curl -H "Authorization: Bearer <tu_token>" http://localhost:3000/auth/me
```
```
powershell
curl -Headers @{ "Authorization" = "Bearer <tu_token>" } http://localhost:3000/auth/me
```
```
bash
curl -H "Authorization: Bearer <tu_token>" "http://localhost:3000/characters/random?source=pokemon"
```
```
powershell
curl -Headers @{ "Authorization" = "Bearer <tu_token>" } "http://localhost:3000/characters/random?source=pokemon"
```
```
bash
curl -X POST http://localhost:3000/characters/vote \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{"source":"pokemon","sourceId":"25","name":"Pikachu","image":"https://img","vote":"like"}'
```
```
powershell
curl -Method Post http://localhost:3000/characters/vote `
  -Headers @{ "Authorization" = "Bearer <tu_token>"; "Content-Type" = "application/json" } `
  -Body '{"source":"pokemon","sourceId":"25","name":"Pikachu","image":"https://img","vote":"like"}'
```

**Errores Comunes**
- `ENOTFOUND` o DNS: revisa `MONGO_URL` y tu conexion.
- `authentication failed`: revisa usuario/password en Atlas.
- `Falta JWT_SECRET`: agrega la variable en `.env`.
