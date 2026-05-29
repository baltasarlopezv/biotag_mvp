create table if not exists usuario (
  id_usuario serial primary key,
  clerk_user_id varchar(255) unique,
  email varchar(255) not null unique,
  nombre varchar(120),
  apellido varchar(120),
  password_hash varchar(255),
  created_at timestamp not null default now()
);

alter table usuario
  add column if not exists clerk_user_id varchar(255),
  alter column password_hash drop not null;

create unique index if not exists idx_usuario_clerk_user_id
  on usuario(clerk_user_id)
  where clerk_user_id is not null;

create table if not exists perfil_salud (
  id_perfil serial primary key,
  id_usuario int not null unique references usuario(id_usuario) on delete cascade,
  edad int,
  peso decimal(6,2),
  altura decimal(6,2)
);

create table if not exists enfermedad (
  id_enfermedad serial primary key,
  nombre varchar(120) not null unique,
  descripcion text
);

create table if not exists dieta (
  id_dieta serial primary key,
  nombre varchar(120) not null unique,
  descripcion text
);

create table if not exists alergia (
  id_alergia serial primary key,
  nombre varchar(120) not null unique,
  descripcion text
);

create table if not exists perfil_salud_enfermedad (
  id_perfil int not null references perfil_salud(id_perfil) on delete cascade,
  id_enfermedad int not null references enfermedad(id_enfermedad) on delete cascade,
  primary key (id_perfil, id_enfermedad)
);

create table if not exists perfil_salud_dieta (
  id_perfil int not null references perfil_salud(id_perfil) on delete cascade,
  id_dieta int not null references dieta(id_dieta) on delete cascade,
  primary key (id_perfil, id_dieta)
);

create table if not exists perfil_salud_alergia (
  id_perfil int not null references perfil_salud(id_perfil) on delete cascade,
  id_alergia int not null references alergia(id_alergia) on delete cascade,
  primary key (id_perfil, id_alergia)
);

create table if not exists historial_escaneo (
  id_historial serial primary key,
  id_usuario int not null references usuario(id_usuario) on delete cascade,
  codigo_barras varchar(80) not null,
  nombre_producto varchar(255),
  marca varchar(160),
  imagen text,
  categoria varchar(160),
  ingredientes text,
  alergenos text,
  alergenos_tags jsonb not null default '[]'::jsonb,
  calorias_100g decimal(10,3),
  grasas_100g decimal(10,3),
  grasas_saturadas_100g decimal(10,3),
  sodio_100g decimal(10,3),
  sal_100g decimal(10,3),
  carbohidratos_100g decimal(10,3),
  azucares_100g decimal(10,3),
  fibra_100g decimal(10,3),
  proteinas_100g decimal(10,3),
  porcion varchar(80),
  calorias_porcion decimal(10,3),
  grasas_porcion decimal(10,3),
  grasas_saturadas_porcion decimal(10,3),
  sodio_porcion decimal(10,3),
  sal_porcion decimal(10,3),
  carbohidratos_porcion decimal(10,3),
  azucares_porcion decimal(10,3),
  fibra_porcion decimal(10,3),
  proteinas_porcion decimal(10,3),
  score_ia int,
  recomendacion_ia text,
  alertas_ia jsonb not null default '[]'::jsonb,
  ia_estado varchar(20) not null default 'pendiente',
  ia_error text,
  resultado varchar(40),
  explicacion text,
  datos_producto_snapshot jsonb,
  fecha timestamp not null default now()
);

alter table historial_escaneo
  add column if not exists imagen text;

alter table historial_escaneo
  add column if not exists categoria varchar(160),
  add column if not exists ingredientes text,
  add column if not exists alergenos text,
  add column if not exists alergenos_tags jsonb not null default '[]'::jsonb,
  add column if not exists calorias_100g decimal(10,3),
  add column if not exists grasas_100g decimal(10,3),
  add column if not exists grasas_saturadas_100g decimal(10,3),
  add column if not exists sodio_100g decimal(10,3),
  add column if not exists sal_100g decimal(10,3),
  add column if not exists carbohidratos_100g decimal(10,3),
  add column if not exists azucares_100g decimal(10,3),
  add column if not exists fibra_100g decimal(10,3),
  add column if not exists proteinas_100g decimal(10,3),
  add column if not exists porcion varchar(80),
  add column if not exists calorias_porcion decimal(10,3),
  add column if not exists grasas_porcion decimal(10,3),
  add column if not exists grasas_saturadas_porcion decimal(10,3),
  add column if not exists sodio_porcion decimal(10,3),
  add column if not exists sal_porcion decimal(10,3),
  add column if not exists carbohidratos_porcion decimal(10,3),
  add column if not exists azucares_porcion decimal(10,3),
  add column if not exists fibra_porcion decimal(10,3),
  add column if not exists proteinas_porcion decimal(10,3),
  add column if not exists score_ia int,
  add column if not exists recomendacion_ia text,
  add column if not exists alertas_ia jsonb not null default '[]'::jsonb,
  add column if not exists ia_estado varchar(20) not null default 'pendiente',
  add column if not exists ia_error text;

update historial_escaneo
set ia_estado = 'listo'
where ia_estado = 'pendiente'
  and (
    resultado is not null
    or recomendacion_ia is not null
    or score_ia is not null
  );

create index if not exists idx_historial_usuario_fecha
  on historial_escaneo(id_usuario, fecha desc);

insert into enfermedad (nombre, descripcion) values
  ('Diabetes', 'Requiere controlar azucares simples y carbohidratos.'),
  ('Hipertension', 'Requiere moderar sodio y ultraprocesados.'),
  ('Colesterol alto', 'Requiere controlar grasas saturadas.'),
  ('Celiaquia', 'Requiere evitar gluten.')
on conflict (nombre) do nothing;

insert into dieta (nombre, descripcion) values
  ('Vegetariana', 'Excluye carnes.'),
  ('Vegana', 'Excluye productos de origen animal.'),
  ('Sin TACC', 'Evita trigo, avena, cebada y centeno.'),
  ('Baja en sodio', 'Prioriza alimentos con bajo contenido de sodio.')
on conflict (nombre) do nothing;

insert into alergia (nombre, descripcion) values
  ('Mani', 'Alergia a mani o trazas.'),
  ('Lactosa', 'Intolerancia o alergia asociada a lacteos.'),
  ('Soja', 'Alergia a soja y derivados.'),
  ('Frutos secos', 'Alergia a almendras, nueces y similares.')
on conflict (nombre) do nothing;
