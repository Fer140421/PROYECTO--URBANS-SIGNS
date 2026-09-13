-- Auditoria previa para el portal de clientes.
-- Este archivo solo consulta datos: no modifica ninguna tabla.
-- Ejecutar en PostgreSQL y corregir cualquier fila devuelta antes de aplicar
-- 01_migracion_relacion_cliente_usuario.sql.

-- Una persona o empresa no debe tener fichas de cliente duplicadas.
SELECT id_persona, COUNT(*) AS cantidad_clientes
FROM clientes
WHERE id_persona IS NOT NULL
GROUP BY id_persona
HAVING COUNT(*) > 1;

SELECT id_empresa, COUNT(*) AS cantidad_clientes
FROM clientes
WHERE id_empresa IS NOT NULL
GROUP BY id_empresa
HAVING COUNT(*) > 1;

-- Una persona no debe tener mas de una cuenta de acceso.
SELECT id_people, COUNT(*) AS cantidad_usuarios
FROM users
WHERE id_people IS NOT NULL
GROUP BY id_people
HAVING COUNT(*) > 1;

-- Referencias huerfanas que impedirian la llave foranea users -> people.
SELECT u.id_user, u.id_people
FROM users u
LEFT JOIN people p ON p.id_people = u.id_people
WHERE u.id_people IS NOT NULL AND p.id_people IS NULL;

-- Cada cliente debe ser exactamente Persona o Empresa, de forma coherente.
SELECT id_cliente, tipo_cliente_persona_empresa, id_persona, id_empresa
FROM clientes
WHERE NOT (
    (tipo_cliente_persona_empresa = 'Persona' AND id_persona IS NOT NULL AND id_empresa IS NULL)
 OR (tipo_cliente_persona_empresa = 'Empresa' AND id_empresa IS NOT NULL AND id_persona IS NULL)
);
