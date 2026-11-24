# Seguridad y tratamiento de datos

**Este es un repositorio público.** Publica únicamente código, estilos, imágenes y datos de demostración. Finanzas está fuera del despliegue.

## Datos privados

Los registros de BRASA, Basketbrain, Juego de Honor y demás aplicaciones no se incorporan a HTML, JavaScript, commits ni GitHub Pages. Los registros privados se guardan en Supabase bajo la tabla `public.app_snapshots` y se autorizan con la identidad de cada usuario. `public.app_snapshot_history` almacena como máximo 14 fechas de recuperación por aplicación y propietario.

Ambas tablas usan **Row Level Security** y políticas de propiedad basadas en `auth.uid()`. Los roles anónimos no reciben acceso a las tablas ni al procedimiento de sincronización. El navegador solo utiliza una clave **publishable**; jamás una clave `service_role`, `secret`, API de administrador o contraseña de base de datos.

## Protección local

El modo sin conexión conserva información en **localStorage** del navegador. **Cerrar sesión no borra la copia local**, y compartir un mismo perfil del navegador puede exponer registros a otra persona que utilice ese equipo. Utiliza un perfil propio y protegido por el sistema operativo; no confíes en cerrar sesión como eliminación del contenido del dispositivo.

La sincronización maneja documentos JSON y no promete respaldar archivos multimedia almacenados en IndexedDB. Guarda copias exportadas en un lugar privado.

## Publicación

- Revisa contenido y diferencias de los HTML antes de cada commit: podrían contener datos privados incrustados.
- Nunca subas archivos de respaldo, exportaciones, extractos, fotos personales ni credenciales.
- Revisa las políticas de privacidad/RLS después de cada migración.
- No dependas solo de `.gitignore` para evitar filtraciones: el historial de Git puede conservar datos que alguna vez se publicaron.
- Los usuarios adicionales deben crearse únicamente si se desea compartir el servicio. Para uso privado, desactiva los nuevos registros una vez creada la cuenta propietaria en la configuración de Supabase.

## Panel de seguridad personal

Desde el portal o cualquier aplicación, abre **☁ Mi cuenta → Seguridad**.
- Consulta las sesiones asociadas a tu cuenta, incluyendo fecha, navegador y dirección de red parcialmente oculta.
- La sesión actual se identifica mediante su JWT; los registros no prueban por sí solos quién estuvo físicamente delante del equipo.
- Puedes pulsar **Cerrar otras sesiones** para revocar las demás sesiones, tras confirmar. Sus tokens de acceso existentes podrían seguir funcionando hasta que expiren.
- **Cerrar sesión** solicita revocar la sesión actual en Supabase y después elimina el token local. Si la conexión falla se elimina el token local, pero la sesión remota podría seguir activa hasta revocarla o expirar.
- El registro público de cuentas puede desactivarse en [Supabase → Authentication → General Configuration](https://supabase.com/dashboard/project/lrwiqqkcwsizrbtytbqw/auth/settings), apagando **Allow new users to sign up**. Ya está creada la cuenta propietaria; conserva el inicio de sesión por email.
- Este apartado no incluye todavía analíticas de visitas a GitHub Pages, seguimiento de accesos HTTP a cada aplicación ni alertas automáticas.
- El procedimiento protegido `public.my_security_sessions` llama a un lector de sesiones en el esquema no expuesto `app_security`, y limita el resultado al `auth.uid()` autenticado.

## Verificaciones

Las políticas RLS y la ausencia de lectura anónima fueron comprobadas. Falta una prueba completa real con una segunda sesión/dispositivo y una simulación de restauración de datos multimedia.

Supabase Security Advisor ha señalado que la protección contra contraseñas filtradas está desactivada; consulta [Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) para habilitarla si está disponible en tu plan.
