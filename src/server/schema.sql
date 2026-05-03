create table if not exists usuario (
  id_usuario serial primary key,
  email varchar(255) not null unique,
  nombre varchar(120),
  apellido varchar(120),
  password_hash varchar(255) not null,
  created_at timestamp not null default now()
);

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
  resultado varchar(40),
  explicacion text,
  datos_producto_snapshot jsonb,
  fecha timestamp not null default now()
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
