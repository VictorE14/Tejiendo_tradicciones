-- ==========================================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE (Tejiendo Tradiciones)
-- Ejecuta este script en el "SQL Editor" de tu panel de Supabase
-- ==========================================================

-- 1. Habilitar extensión pgcrypto para encriptación de contraseñas y UUIDs
create extension if not exists "pgcrypto";

-- ==========================================================
-- 2. TABLA: usuarios_admin (Para login y registro de administradores)
-- ==========================================================
create table if not exists usuarios_admin (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'admin', -- 'admin', 'vendedor'
  activo boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
alter table usuarios_admin enable row level security;

-- Política de seguridad: solo lectura/escritura mediante funciones seguras
create policy "Acceso restringido a usuarios_admin" 
  on usuarios_admin for all 
  using (false);

-- Función segura para registrar administradores (cifra con bcrypt)
create or replace function registrar_admin(
  p_nombre text,
  p_email text,
  p_password text,
  p_rol text default 'admin'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  nuevo_id uuid;
begin
  if exists (select 1 from usuarios_admin where email = lower(trim(p_email))) then
    return jsonb_build_object('success', false, 'message', 'El correo ya está registrado');
  end if;

  if length(p_password) < 6 then
    return jsonb_build_object('success', false, 'message', 'La contraseña debe tener mínimo 6 caracteres');
  end if;

  insert into usuarios_admin (nombre, email, password_hash, rol)
  values (
    trim(p_nombre),
    lower(trim(p_email)),
    crypt(p_password, gen_salt('bf')),
    coalesce(p_rol, 'admin')
  )
  returning id into nuevo_id;

  return jsonb_build_object(
    'success', true,
    'message', 'Usuario registrado exitosamente',
    'id', nuevo_id
  );
end;
$$;

-- Función segura para validar login de administradores
create or replace function login_admin(
  p_email text,
  p_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  usuario record;
begin
  select id, nombre, email, rol, activo, password_hash
  into usuario
  from usuarios_admin
  where email = lower(trim(p_email));

  if not found then
    return jsonb_build_object('success', false, 'message', 'Credenciales no válidas');
  end if;

  if not usuario.activo then
    return jsonb_build_object('success', false, 'message', 'La cuenta está desactivada');
  end if;

  if usuario.password_hash = crypt(p_password, usuario.password_hash) then
    return jsonb_build_object(
      'success', true,
      'user', jsonb_build_object(
        'id', usuario.id,
        'nombre', usuario.nombre,
        'email', usuario.email,
        'rol', usuario.rol
      )
    );
  else
    return jsonb_build_object('success', false, 'message', 'Credenciales no válidas');
  end if;
end;
$$;

-- Crear el primer usuario administrador por defecto (admin@tejiendo.com / admin123)
insert into usuarios_admin (nombre, email, password_hash, rol)
values (
  'Administrador Principal',
  'admin@tejiendo.com',
  crypt('admin123', gen_salt('bf')),
  'admin'
)
on conflict (email) do nothing;


-- ==========================================================
-- 3. TABLA: productos (Control de inventario de la tienda)
-- ==========================================================
create table if not exists productos (
  id text primary key,
  codigo text not null unique,
  nombre text not null,
  precio numeric(10,2) not null,
  stock integer not null default 0,
  categoria text not null,
  descripcion text,
  medidas text,
  color text,
  imagen text,
  destacado boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
alter table productos enable row level security;

-- Política 1: Lectura pública (Cualquier visitante de la tienda puede consultar productos)
create policy "Lectura pública de productos"
  on productos for select
  using (true);

-- Política 2: Escritura (Insert, Update, Delete) solo para administradores
-- (Al conectar la API con llave de servicio o RLS de admin)
create policy "Administración completa de productos"
  on productos for all
  using (true)
  with check (true);

-- ==========================================================
-- 4. INSERTAR PRODUCTOS INICIALES (Datos semilla sin artesanas)
-- ==========================================================
insert into productos (id, codigo, nombre, precio, stock, categoria, descripcion, medidas, color, imagen) values
('AR-001', 'AR-001', 'Flores del Alma', 80, 8, 'Aretes', 'Aretes tejidos a crochet con delicado diseño floral en azul.', '', '#8cb3d4', 'images/articulo/articulo1.png'),
('AR-002', 'AR-002', 'Selva Mística', 80, 5, 'Aretes', 'Aretes tejidos a crochet con delicado diseño de hojas.', '', '#7b9e6b', 'images/articulo/articulo2.png'),
('AR-003', 'AR-003', 'Uva Bomba', 70, 4, 'Aretes', 'Aretes tejidos a crochet con forma de racimos de uva en tonos morado y verde.', '', '#8b5a7a', 'images/articulo/articulo3.png'),
('AR-004', 'AR-004', 'Lila pop', 80, 6, 'Aretes', 'Aretes tejidos a crochet con delicado diseño floral en tono morado.', '', '#b28bc9', 'images/articulo/articulo4.png'),
('AR-005', 'AR-005', 'Alas de Hilo', 80, 3, 'Aretes', 'Aretes tejidos a crochet con diseño de mariposa.', '', '#d9b3a7', 'images/articulo/articulo5.png'),
('AR-006', 'AR-006', 'Flor Roja', 60, 4, 'Aretes', 'Aretes tejidos a crochet con delicado diseño floral en rojo.', '', '#c45a5a', 'images/articulo/articulo6.png'),
('BL-001', 'BL-001', 'Azul Encanto', 550, 2, 'Blusa', 'Blusa tejida a crochet con diseño calado y cuello amplio.', '51x52 cm', '#4a7f9c', 'images/articulo/articulo13.png'),
('BL-002', 'BL-002', 'Suspiro de Rosa', 400, 3, 'Blusa', 'Top tejido a crochet con flor central y delicados detalles calados.', '42x45 cm', '#d998a3', 'images/articulo/articulo14.png'),
('BL-006', 'BL-006', 'Azul Profundo', 500, 0, 'Blusa', 'Prenda tejida a crochet en tono azul con diseño calado.', '50x32 cm', '#275b7a', 'images/articulo/articulo18.png'),
('CE-001', 'CE-001', 'Jardín Romántico', 350, 6, 'Cenefa', 'Cenefa tejida a crochet con motivos florales.', '13x53 cm', '#bba88c', null),
('CE-002', 'CE-002', 'Dulce Abanico', 250, 4, 'Cenefa', 'Cenefa de justán tejida a crochet con diseño de abanicos.', '10x51 cm', '#cbb59b', null)
on conflict (id) do nothing;

-- ==========================================================
-- 5. BUCKET DE SUPABASE STORAGE (Para subir fotos de productos)
-- ==========================================================
-- Crear el bucket público "productos_fotos"
insert into storage.buckets (id, name, public)
values ('productos_fotos', 'productos_fotos', true)
on conflict (id) do nothing;

-- Permitir ver/descargar fotos públicamente
create policy "Lectura publica fotos productos"
  on storage.objects for select
  using (bucket_id = 'productos_fotos');

-- Permitir subir fotos al bucket
create policy "Subida publica fotos productos"
  on storage.objects for insert
  with check (bucket_id = 'productos_fotos');

-- Permitir actualizar/reemplazar fotos
create policy "Actualizacion fotos productos"
  on storage.objects for update
  using (bucket_id = 'productos_fotos');

-- Permitir eliminar fotos
create policy "Eliminacion fotos productos"
  on storage.objects for delete
  using (bucket_id = 'productos_fotos');

