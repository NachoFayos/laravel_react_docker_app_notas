# Prueba Técnica — Notas CRUD (Laravel 11 + React + Docker)

App mínima de **Notas (CRUD)** con:

* **Backend**: Laravel 11 (API JSON) + **SQLite**
* **Frontend**: React + Vite
* **Infra**: Docker Compose (Nginx ↔ PHP-FPM 8.2 ↔ Node 20)
* **Proxy**:

  * `/api/**` → Laravel (php-fpm)
  * `/` → Vite dev server (React)

---

## Requisitos

* Docker y Docker Compose
* Puertos libres: **8082** (Nginx) y **5173** (Vite)

---

## Arranque rápido

```bash
docker compose up -d
```

* Frontend: [http://localhost:8082/](http://localhost:8082/)
* API base: [http://localhost:8082/api](http://localhost:8082/api)
* Health: [http://localhost:8082/api/health](http://localhost:8082/api/health) → `{"data":{"db":"ok"},"message":null,"errors":null}`

> El servicio **backend** instala dependencias, asegura el SQLite y ejecuta **`php artisan migrate --force`** (no `fresh`, no `seed`).

---

## Estructura

```
.
├─ backend/                 # Laravel 11 (API)
│  ├─ app/  config/  routes/  tests/
│  ├─ database/
│  │  ├─ database.sqlite     # 30 notas incluidas
│  │  ├─ migrations/ factories/
│  ├─ public/ storage/
│  ├─ composer.json  composer.lock  artisan
├─ frontend/                # React + Vite
│  ├─ src/  public/  index.html
│  ├─ package.json  package-lock.json
├─ docker/
│  ├─ nginx/default.conf     # /api → php-fpm, / → Vite
│  └─ php-fpm/www.conf
├─ docker-compose.yml
└─ README.md
```

---

## API (JSON)

Formato de respuesta:

```json
{ "data": ..., "message": null, "errors": null }
```

Endpoints:

* `GET  /api/health`
* `GET  /api/notes?q=texto&page=1`  (10 por página, `created_at desc`, filtro en **title**)
* `POST /api/notes`  (`title` requerido ≤255, `content` opcional)
* `GET  /api/notes/{id}`
* `PUT  /api/notes/{id}`
* `DELETE /api/notes/{id}`

Códigos: `200`, `201`, `204`, `404`, `422`.

Ejemplo (Windows PowerShell):

```powershell
curl.exe -X POST "http://localhost:8082/api/notes" `
  -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json" `
  --data-urlencode "title=Nota demo" --data-urlencode "content=Contenido de ejemplo"
```

---

## Comandos útiles

* Reiniciar contenedores:

  ```bash
  docker compose up -d --force-recreate
  ```
* Tests backend:

  ```bash
  docker compose exec backend bash -lc "php artisan test"
  ```
* Tests frontend:

  ```bash
  docker compose exec frontend sh -lc "npm test"
  ```
* Contar notas:

  ```bash
  docker compose exec backend bash -lc "php artisan tinker --execute \"echo \\App\\Models\\Note::count();\""
  ```

---

## Troubleshooting

* **`vendor/autoload.php` no existe** → `docker compose exec backend bash -lc "composer install --no-interaction --prefer-dist"`
* **502/404** → `docker compose ps` y verifica `docker/nginx/default.conf` (frontend:5173, backend:9000).
* **Permisos** (Linux/macOS): `docker compose exec backend bash -lc "chmod -R 775 storage bootstrap/cache database"`

---

## Criterios cumplidos

* JSON consistente `{data, message, errors}`
* HTTP correctos (`201` create, `204` delete, `422` validación, `404` no existe)
* Paginación 10/pg + filtro `q` en `title`
* Un solo `docker-compose.yml` para todo
