# Recuperación de contraseña: contrato y despliegue

Los dos frontends usan el mismo backend. Las rutas públicas conservan sus nombres,
pero `POST /users/reset-password` ahora exige `resetToken`; las peticiones antiguas
con solo correo y contraseña se rechazan. No se mantiene un modo inseguro de compatibilidad.

1. `POST /users/enviar-codigo-recuperacion`: `{ "email": "..." }`.
2. `POST /users/verify-recovery-code`: `{ "email": "...", "code": "123456" }`.
   Devuelve `{ "message": "...", "resetToken": "..." }`.
3. `POST /users/reset-password`: `{ "email": "...", "resetToken": "...", "newPassword": "..." }`.
4. Administración: `PATCH /users/admin/reset-password`, `{ "userId": 1, "newPassword": "..." }`.
   Requiere sesión autenticada y rol `Gerente`. No envía la contraseña por correo.

El código vence en 5 minutos, tiene 5 intentos y puede reenviarse después de 60 segundos.
El token vence en 10 minutos y se consume junto con la actualización de la contraseña.
Un reenvío exitoso o un cambio administrativo invalida la recuperación anterior.
Los códigos de registro no sirven para recuperar contraseñas.
Las contraseñas requieren al menos 8 caracteres y un máximo de 72 bytes UTF-8 (BCrypt).
Los errores de recuperación devuelven JSON con `message`: 400 para datos/código/token
inválidos, 429 para reenvío anticipado y 503 para fallo del servicio de correo.

Los estados se guardan en `password_recovery`, con hashes SHA-256 del código y token.
Cada operación bloquea la fila del usuario dentro de una transacción; la actualización
de contraseña y el consumo del token son atómicos. El token se guarda únicamente en
memoria en los frontends; al recargar la página se debe solicitar otro código.

## Despliegue coordinado

- Preparar las compilaciones del backend, Frontend-urban-signs y LANDING_PAGE_URBAN_SIGNS.
- Con `spring.jpa.hibernate.ddl-auto=update`, Hibernate crea la nueva tabla al iniciar.
  Si las migraciones son manuales, aplicar `password-recovery.sql` antes del backend.
- Actualizar el backend y publicar ambas aplicaciones en la misma ventana de despliegue.
- Recargar las pestañas antiguas y empezar nuevamente cualquier recuperación en curso.
- Verificar con una cuenta de prueba el envío real, recuperación en ambas aplicaciones
  y cambio administrativo con Gerente. Verificar el rechazo para otros roles.
- Si hay que revertir un frontend, mantener bloqueado el reset público sin token;
  no restaurar el endpoint vulnerable como solución de compatibilidad.

Esta modificación no cambia la política existente de duración de las sesiones de login.
