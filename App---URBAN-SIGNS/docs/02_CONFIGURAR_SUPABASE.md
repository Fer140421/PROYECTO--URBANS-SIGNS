# Configurar Supabase paso a paso

## 1. Crear proyecto

Desde el panel web de Supabase crea un proyecto nuevo.

## 2. Crear esquema

Abre SQL Editor y ejecuta:

`supabase/01_schema_completo.sql`

Se crean:

- `profiles`
- `incidents`
- índices
- trigger `updated_at`
- trigger de perfil al registrar usuario
- función `is_admin()`
- políticas RLS
- bucket `incident-images`
- políticas de Storage

## 3. Configurar Auth

Para laboratorio puedes desactivar temporalmente `Confirm email` para que el registro entregue sesión inmediatamente. Para un proyecto real, decide esto según el flujo de seguridad requerido.

## 4. Copiar configuración

```bash
cp config/live.example.json config/live.json
```

Completa URL y publishable key.

Nunca copies la `service_role` al proyecto Flutter.

## 5. Ejecutar

```bash
flutter run --dart-define-from-file=config/live.json
```

## 6. Crear admin opcional

Registra primero el usuario desde la app. Luego copia su UUID desde Authentication > Users y ejecuta:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID_DEL_USUARIO';
```

El admin puede modificar/eliminar reportes de terceros; un usuario normal sólo los propios.
