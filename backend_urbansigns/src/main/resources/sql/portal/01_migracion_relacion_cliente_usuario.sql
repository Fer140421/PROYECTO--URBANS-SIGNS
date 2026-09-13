-- Migracion manual para PostgreSQL.
-- PRECONDICION: ejecutar primero 00_auditoria_relacion_cliente_usuario.sql
-- y corregir todas las inconsistencias que reporte.
-- La columna id_user queda nullable temporalmente para clientes historicos que
-- aun no tengan cuenta. El registro del portal siempre debera asignarla.

BEGIN;

ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS id_user BIGINT;

ALTER TABLE clientes
    ADD CONSTRAINT fk_clientes_usuario
    FOREIGN KEY (id_user) REFERENCES users(id_user);

ALTER TABLE clientes
    ADD CONSTRAINT uq_clientes_id_user UNIQUE (id_user);

ALTER TABLE clientes
    ADD CONSTRAINT uq_clientes_id_persona UNIQUE (id_persona);

ALTER TABLE clientes
    ADD CONSTRAINT uq_clientes_id_empresa UNIQUE (id_empresa);

ALTER TABLE users
    ADD CONSTRAINT fk_users_persona
    FOREIGN KEY (id_people) REFERENCES people(id_people);

ALTER TABLE users
    ADD CONSTRAINT uq_users_id_people UNIQUE (id_people);

-- NOT VALID permite conservar temporalmente datos historicos inconsistentes,
-- pero obliga a que toda fila nueva o modificada respete la regla.
ALTER TABLE clientes
    ADD CONSTRAINT ck_clientes_titular_exclusivo
    CHECK (
        (tipo_cliente_persona_empresa = 'Persona' AND id_persona IS NOT NULL AND id_empresa IS NULL)
        OR
        (tipo_cliente_persona_empresa = 'Empresa' AND id_empresa IS NOT NULL AND id_persona IS NULL)
    ) NOT VALID;

COMMIT;

-- Una vez depurados los clientes historicos, ejecutar por separado:
-- ALTER TABLE clientes VALIDATE CONSTRAINT ck_clientes_titular_exclusivo;
