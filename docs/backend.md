# Cuentas, comunidad y suscripción: estado y guía de integración

## Qué hay hoy

| Parte | Estado |
| --- | --- |
| Lectura (modo libro, modo renglón, OCR, biblioteca) | Funciona en el dispositivo, sin servidor. |
| Planes y permisos | Funcionan. Se configuran en `src/config/plans.ts` y se aplican en la interfaz y en el servicio de datos. |
| Límite de la biblioteca | Funciona: cuenta los documentos de la cuenta (o del dispositivo, sin sesión) contra el límite del plan. |
| Cuentas, reseñas, likes y Reading Club | Funcionan con el **servicio local de prueba**: todo queda en este dispositivo (IndexedDB). La interfaz lo avisa. |
| Servidor de cuentas y comunidad | **Pendiente.** Falta elegir el proveedor y sus credenciales. |
| Recuperación de contraseña por correo | **Pendiente** del servidor (el servicio local no manda correos y lo dice). |
| Contratación, consulta y cancelación de la suscripción | **Pendiente** de la plataforma de pagos. Los botones responden «estará disponible próximamente». El precio está sin definir. |
| Sincronizar biblioteca y preferencias entre dispositivos | **Pendiente** del servidor. Hoy siguen a la cuenta dentro del mismo dispositivo. |

### El servicio local de prueba

`src/services/localBackend.ts` implementa el contrato completo con IndexedDB y aplica las mismas reglas que el servidor deberá aplicar. Sirve para desarrollar y probar, pero **no es una cuenta real**:

- no hay servidor: lo publicado solo lo ve quien usa ese dispositivo;
- no se envían correos;
- las contraseñas no se guardan en claro (hash PBKDF2-SHA-256 con sal, 150 000 iteraciones).

### Verificar premium en desarrollo

Abrí la app con `?dev=1` (por ejemplo, `https://…/ReadingAPP/?dev=1`) y aparece el panel «Desarrollo», que cambia el plan de la cuenta de prueba entre gratuito y premium. Se apaga con `?dev=0`.

Solo actúa sobre el servicio local. Con un servidor real, el plan lo determina la suscripción y el panel no puede cambiarlo.

## Punto de integración

Toda la app habla con la interfaz `Backend` de `src/services/backend.ts` y nunca con una implementación concreta. Para conectar el servidor:

1. **Proveedor.** Elegir uno de autenticación y base de datos. Por ejemplo, Supabase (autenticación con correo, recuperación de contraseña y Postgres con reglas por fila) o Firebase.
2. **Adaptador.** Implementar `src/services/remoteBackend.ts` con ese proveedor. Hoy es un lugar reservado que responde «servicio no disponible» en cada operación.
3. **Configuración.** Compilar con `VITE_BACKEND=remote` y las credenciales públicas del proveedor (ver `.env.example`). Las claves secretas nunca van en la app.
4. **Pagos.** Conectar la plataforma (por ejemplo, Mercado Pago o Stripe) en `subscription` (`startCheckout`, `cancel`, `manage`). El plan del usuario lo actualiza el servidor al recibir la confirmación del pago (webhook), nunca la app.
5. **Tipos.** Los tipos de datos están en `src/services/types.ts`.

## Reglas que el servidor debe validar

La interfaz las refleja, pero la validación de verdad tiene que estar en el servidor.

- **Publicar reseñas y dar likes:** requiere sesión.
- **Likes:**
  - uno por persona y reseña, que se puede retirar;
  - no se da like a la reseña propia;
  - el contador se recalcula en la misma transacción.
- **Propiedad:** solo quien publicó edita o elimina su reseña, su conversación o su respuesta.
- **Reading Club:** leer, publicar y responder requiere el plan premium.
- **Validación de campos:** largos máximos (`TEXT_LIMITS` en `src/config/community.ts`) y categorías de las listas configuradas.
- **Límite de documentos del plan:** cuando la biblioteca se sincronice (`PLANS[plan].limits.maxDocuments`). Si una cuenta queda por encima del límite, conserva el acceso y no puede agregar más.
- **Plan del usuario:**
  - lo cambia solo el servidor, según la suscripción;
  - el usuario no puede modificar su propio plan.
- **Búsqueda de reseñas:** sin distinguir mayúsculas ni tildes, por nombre del libro o autor. En Postgres: extensión `unaccent` más `lower`, con índice `pg_trgm`.
- **Orden «Más valoradas»:** `REVIEW_RANKING` en `src/config/community.ts`. Puede ser `top` (más likes; a igualdad, la más reciente) o `hot`, la fórmula de Reddit, en la que los likes pesan en escala logarítmica frente a la antigüedad.

## Esquema de referencia (Postgres con reglas por fila)

> Referencia para el servidor. **No está probado contra una base real**: revisarlo al elegir el proveedor.

```sql
create extension if not exists unaccent;
create extension if not exists pg_trgm;

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null unique check (char_length(username) between 3 and 30),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles on delete cascade,
  book_title text not null check (char_length(book_title) between 1 and 150),
  book_author text not null check (char_length(book_author) between 1 and 120),
  category text not null,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 10000),
  spoiler boolean not null default false,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index reviews_search on reviews using gin ((lower(unaccent(book_title || ' ' || book_author))) gin_trgm_ops);

create table review_likes (
  review_id uuid not null references reviews on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)          -- un like por persona y reseña
);

create table club_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  body text not null check (char_length(body) between 1 and 20000),
  category text not null,
  reply_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_activity timestamptz not null default now()
);

create table club_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references club_threads on delete cascade,
  author_id uuid not null references profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create function is_premium() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and plan = 'premium')
$$;

-- El contador de likes se mantiene en el servidor.
create function sync_review_likes() returns trigger language plpgsql security definer as $$
begin
  update reviews set likes = (select count(*) from review_likes where review_id = coalesce(new.review_id, old.review_id))
   where id = coalesce(new.review_id, old.review_id);
  return null;
end $$;
create trigger review_likes_count after insert or delete on review_likes
  for each row execute function sync_review_likes();

alter table profiles enable row level security;
alter table reviews enable row level security;
alter table review_likes enable row level security;
alter table club_threads enable row level security;
alter table club_replies enable row level security;

-- Perfiles: nombres públicos; cada quien edita el suyo, pero nunca su plan.
create policy "perfiles visibles" on profiles for select using (true);
create policy "editar el perfil propio" on profiles for update using (id = auth.uid());
revoke update (plan) on profiles from authenticated;   -- el plan lo cambia el servidor de pagos

-- Reseñas: lectura pública; escritura con sesión y solo lo propio.
create policy "leer reseñas" on reviews for select using (true);
create policy "publicar reseñas" on reviews for insert with check (author_id = auth.uid());
create policy "editar reseñas propias" on reviews for update using (author_id = auth.uid());
create policy "borrar reseñas propias" on reviews for delete using (author_id = auth.uid());
revoke update (likes) on reviews from authenticated;

-- Likes: uno por persona, retirables, nunca a lo propio.
create policy "ver likes" on review_likes for select using (true);
create policy "dar like" on review_likes for insert with check (
  user_id = auth.uid() and not exists (select 1 from reviews r where r.id = review_id and r.author_id = auth.uid())
);
create policy "retirar like" on review_likes for delete using (user_id = auth.uid());

-- Reading Club: todo requiere premium; editar y borrar, solo lo propio.
create policy "leer el club" on club_threads for select using (is_premium());
create policy "publicar en el club" on club_threads for insert with check (author_id = auth.uid() and is_premium());
create policy "editar lo propio" on club_threads for update using (author_id = auth.uid() and is_premium());
create policy "borrar lo propio" on club_threads for delete using (author_id = auth.uid() and is_premium());
create policy "leer respuestas" on club_replies for select using (is_premium());
create policy "responder" on club_replies for insert with check (author_id = auth.uid() and is_premium());
create policy "editar respuesta propia" on club_replies for update using (author_id = auth.uid() and is_premium());
create policy "borrar respuesta propia" on club_replies for delete using (author_id = auth.uid() and is_premium());
```

El contador de respuestas (`reply_count`, `last_activity`) se mantiene con un disparador equivalente al de los likes.
