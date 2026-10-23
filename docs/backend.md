# Cuentas, comunidad y suscripción: estado y guía de integración

## Qué hay hoy

| Parte | Estado |
| --- | --- |
| Lectura (modo libro, modo renglón, OCR, biblioteca) | Funciona en el dispositivo, sin servidor. |
| Planes y permisos | Funcionan. Se configuran en `src/config/plans.ts` y se aplican en la interfaz y en el servicio de datos. |
| Límite de la biblioteca | Funciona: cuenta los documentos de la cuenta (o del dispositivo, sin sesión) contra el límite del plan. |
| Cuentas, reseñas, likes y Reading Club | Funcionan con el **servicio local de prueba**: todo queda en este dispositivo (IndexedDB). La interfaz lo avisa. |
| Edad mínima del Reading Club (16 años, D09) | Funciona en la interfaz y en el servicio local de prueba: la fecha de nacimiento se pide al entrar por primera vez al club, se carga una sola vez y no se cambia desde la app. En el servidor, **pendiente** (ver «Edad mínima del Reading Club»). |
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
- **Reading Club:** leer, publicar y responder requiere **16 años o más** (con la fecha de nacimiento cargada) **y** el plan premium. Registrarse no tiene límite de edad.
- **Fecha de nacimiento:**
  - se carga una sola vez, con la función `set_birth_date`; después, el usuario no puede cambiarla (solo soporte, con la clave de servicio, para corregir un error comprobado);
  - no es pública: otras personas no la leen;
  - se rechaza una fecha inexistente, futura o anterior a 1900.
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
  -- Se pide al entrar por primera vez al Reading Club y se carga una sola vez (ver «Edad mínima del Reading Club»).
  birth_date date check (birth_date >= date '1900-01-01'),
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

-- 16 años cumplidos a la fecha del servidor (CLUB_MIN_AGE en src/config/community.ts).
-- Quien nació un 29 de febrero los cumple el 1 de marzo en los años no bisiestos, como en la app (src/lib/age.ts).
create function club_age_ok() returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles
     where id = auth.uid()
       and birth_date is not null
       and birth_date <= (current_date - interval '16 years')::date
  )
$$;

-- Miembro del Reading Club: 16 años o más y plan premium.
create function club_member() returns boolean language sql stable security definer as $$
  select is_premium() and club_age_ok()
$$;

-- Carga única de la fecha de nacimiento. La app la llama (setBirthDate); nadie actualiza la columna directo.
create function set_birth_date(d date) returns void language plpgsql security definer as $$
begin
  if auth.uid() is null then raise exception 'auth-required'; end if;
  if d is null or d < date '1900-01-01' or d > current_date then raise exception 'invalid'; end if;
  update profiles set birth_date = d where id = auth.uid() and birth_date is null;
  if not found then raise exception 'forbidden: la fecha de nacimiento ya está cargada'; end if;
end $$;

-- Cada quien lee solo su propia fecha (para mostrarla en el perfil y decidir qué pantalla del club ver).
create function my_birth_date() returns date language sql stable security definer as $$
  select birth_date from profiles where id = auth.uid()
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

-- Perfiles: nombres públicos; cada quien edita el suyo, pero nunca su plan ni su fecha de nacimiento.
create policy "perfiles visibles" on profiles for select using (true);
create policy "editar el perfil propio" on profiles for update using (id = auth.uid());
revoke update (plan) on profiles from authenticated;   -- el plan lo cambia el servidor de pagos
-- En Postgres, revocar una columna no anula un permiso dado a toda la tabla (Supabase da permisos de
-- tabla a anon y authenticated). Por eso, para la fecha de nacimiento, se quitan los de tabla y se
-- dan por columna. Vale también para el plan: con esto, `revoke update (plan)` queda cubierto.
revoke select, update on profiles from anon, authenticated;
grant select (id, username, plan, created_at) on profiles to anon, authenticated;   -- birth_date no es pública
grant update (username) on profiles to authenticated;                               -- ni plan ni birth_date

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

-- Reading Club: todo requiere 16 años o más y premium (club_member); editar y borrar, solo lo propio.
create policy "leer el club" on club_threads for select using (club_member());
create policy "publicar en el club" on club_threads for insert with check (author_id = auth.uid() and club_member());
create policy "editar lo propio" on club_threads for update using (author_id = auth.uid() and club_member());
create policy "borrar lo propio" on club_threads for delete using (author_id = auth.uid() and club_member());
create policy "leer respuestas" on club_replies for select using (club_member());
create policy "responder" on club_replies for insert with check (author_id = auth.uid() and club_member());
create policy "editar respuesta propia" on club_replies for update using (author_id = auth.uid() and club_member());
create policy "borrar respuesta propia" on club_replies for delete using (author_id = auth.uid() and club_member());
```

El contador de respuestas (`reply_count`, `last_activity`) se mantiene con un disparador equivalente al de los likes.

## Edad mínima del Reading Club

Decisión D09: registrarse no tiene límite de edad; el Reading Club exige 16 años o más, además del plan premium. La edad se configura en `CLUB_MIN_AGE` (`src/config/community.ts`); si cambia, hay que cambiar también el `16` de `club_age_ok()`.

**En la app** (`src/lib/access.ts`, `canUse('club', …)`), el orden de los controles es:

1. sin sesión: iniciar sesión;
2. sin fecha de nacimiento: se pide, antes de ofrecer premium (motivo `age-unknown`);
3. menor de 16: el club no está disponible para su edad, sin ofrecerle premium (motivo `age`);
4. con 16 o más y plan gratuito: aviso de premium;
5. con 16 o más y premium: acceso.

**En el servicio** (`Backend.setBirthDate` y las operaciones del club), los errores son:

| Caso | Código de `ServiceError` |
| --- | --- |
| Sin sesión | `auth-required` |
| Sin fecha de nacimiento | `age-required` |
| Menor de 16 | `age-restricted` |
| 16 o más sin premium | `premium-required` |
| Fecha inválida, futura o anterior a 1900 | `invalid` |
| La fecha ya estaba cargada | `forbidden` |

**En el servidor**, con el esquema de arriba:

- columna `profiles.birth_date` (fecha, sin hora), que no es pública;
- `set_birth_date(d)` la carga una sola vez; `my_birth_date()` la devuelve solo a su dueño;
- las reglas por fila del club usan `club_member()`, que exige `is_premium()` y `club_age_ok()`;
- el adaptador remoto (`remoteBackend.ts`) completa `User.birthDate` con `my_birth_date()` y traduce los errores de `set_birth_date` a los códigos de la tabla.

**Fechas y zonas horarias.** La app calcula la edad con la fecha del dispositivo; el servidor, con la suya (`current_date`, en UTC si no se configura otra). El día del cumpleaños puede haber unas horas de diferencia: decide el servidor. Por la misma razón, alguien en una zona horaria adelantada a UTC podría ver rechazada la fecha de hoy como «futura» durante unas horas; no afecta a ninguna fecha de nacimiento realista.

> No probado contra una base real: revisarlo junto con el resto del esquema al elegir el proveedor.
