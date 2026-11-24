# Sincronización privada de Mi Ecosistema

Estado al 24 de noviembre de 2026: **base de datos activa, un usuario confirmado, RLS comprobado y tres respaldos privados cargados** (BRASA, Basketbrain, Juego de Honor). El cliente web usa exclusivamente una clave pública. BRASA tiene al menos dos revisiones sincronizadas. Faltan pruebas prácticas completas desde dos dispositivos y validar archivos multimedia de Patinaje/Calistenia.

## Arquitectura
- GitHub Pages solo entrega las aplicaciones y el código público.
- Supabase Auth identifica al usuario.
- `public.app_snapshots` guarda un documento JSON por usuario y aplicación.
- Las políticas RLS permiten consultar y modificar únicamente el registro del usuario autenticado. El procedimiento RPC exige la revisión esperada para no sobrescribir silenciosamente cambios de otro equipo.
- Cuando no hay cuenta configurada, las apps continúan guardando localmente. Nunca se envían datos personales a GitHub.
- Las copias JSON antiguas son privadas y NO deben subirse al repositorio. **Finanzas está excluida**.

## Proyecto creado

- Supabase: [Mi Ecosistema Privado](https://supabase.com/dashboard/project/lrwiqqkcwsizrbtytbqw)
- Región: São Paulo (`sa-east-1`)
- Base: `public.app_snapshots` y `public.app_snapshot_history`; ambas con RLS y propiedad por usuario. RPC `save_app_snapshot` con control de revisión. El historial conserva un máximo de 14 fechas por app, una copia previa al primer cambio de cada día, con zona horaria de Bogotá.
- Portal: [Mi Ecosistema](https://estructura2500-ship-it.github.io/Mi-Ecosistema/ecosistema-personal/)
- Para confirmar por correo el primer usuario, configura primero **Authentication → URL Configuration**: [configurar enlaces](https://supabase.com/dashboard/project/lrwiqqkcwsizrbtytbqw/auth/url-configuration). Site URL: `https://estructura2500-ship-it.github.io/Mi-Ecosistema/ecosistema-personal/`. Añade esta misma URL a los redirects permitidos.
- Abre **☁ Mi cuenta** en el portal y crea una cuenta personal. Supabase puede enviar correo de verificación; nunca compartas contraseña en chats.
- Verifica inicio de sesión y que los datos se guardan y restauran antes de confiar en la sincronización.
- Cuenta de correo confirmada. Los respaldos privados de **BRASA, Basketbrain y Juego de Honor** ya están vinculados a esta cuenta **sin publicarlos en GitHub**.
- Para uso estrictamente individual, desactiva los nuevos registros públicos en **Supabase → Authentication → Providers → Email**, después de comprobar que puedes iniciar sesión. Comprueba la configuración actual antes de hacer el cambio.

La clave configurada en frontend es **publishable** y no otorga por sí sola acceso a registros; nunca pongas una `secret` o `service_role` en páginas públicas.

## Cómo se sincroniza
- Los datos continúan guardándose inmediatamente en el navegador como antes.
- Con sesión iniciada, se sincronizan automáticamente los campos JSON en cambios, reconexión y apertura.
- Si el equipo no tiene registros pero la nube sí, se recupera el estado y se recarga la aplicación.
- Si una app encuentra dos versiones divergentes, se detiene para pedirte una decisión. No sobreescribe automáticamente la versión que difiere. Las opciones solo aparecen ante conflicto real.
- Al recuperar una versión remota sobre otra local, se intenta descargar una copia de emergencia antes de recargar. Confirma que el navegador permitió esa descarga. **Cerrar sesión no borra los datos locales**.
- Este sistema es una **sincronización de instantáneas**, no edición colaborativa simultánea; evita editar la misma app en dos equipos offline a la vez.
- Todos los datos se transmiten mediante HTTPS y se aíslan con RLS; **no** hay cifrado de extremo a extremo.
- Credenciales de sesión permanecen en almacenamiento local del navegador. Usa dispositivos de confianza; cierra sesión en equipos ajenos.


## Comprobar copias anteriores

Abre la aplicación y entra en **☁ Mi cuenta → Copias anteriores**. Las copias se guardan automáticamente cuando se sustituye una revisión anterior, como máximo una fecha por día y hasta 14 fechas por aplicación. Puedes descargar un archivo JSON anterior o restaurarlo, tras confirmar. La recuperación sustituye la copia actual en la nube y en el navegador. Si aún no se ha realizado un cambio después de instalar esta función, el historial puede estar vacío; esto es normal. 

El portal central permite revisar **☁ Mi cuenta → Estado de mis aplicaciones** para comprobar qué aplicaciones tienen una copia en la nube. Las copias diarias no son un sistema de respaldo eterno: conviene mantener exportaciones JSON adicionales de fechas importantes, guardadas de forma privada.

## Apps y límites
El cliente está instalado en BRASA, Basketbrain, PULSO, Juego de Honor, Calistenia, ATLAS y en la página contenedora de Patinaje. Para Patinaje y Calistenia se sincroniza el progreso estructurado almacenado en localStorage, **no** los archivos multimedia que cada app guarde en IndexedDB.

La interfaz de Patinaje original se conserva en `apps/patinaje/index.html` y se abre desde `apps/patinaje/cloud.html` para añadir cuenta sin reescribir su HTML de gran tamaño.

## Pruebas obligatorias al activar
1. Registra dos usuarios de prueba con correos distintos. Comprueba que el usuario B no puede leer, modificar ni listar registros del A.
2. Con A guarda un cambio en BRASA, recarga el sitio y comprueba que persiste.
3. Abre A en un perfil de navegador limpio y comprueba que recupera el cambio.
4. Cambia datos en ambos perfiles para comprobar resolución de conflicto sin sobrescritura silenciosa.
5. Prueba iniciar sesión, cerrar sesión, refresh de token, desconexión y reconexión.
6. Comprueba las otras apps y los respaldos JSON de emergencia antes de confiar datos esenciales a la nube.

**Importante:** hasta que el proyecto Supabase esté provisionado y las pruebas anteriores pasen, los datos siguen siendo locales. Conserva los HTML y JSON originales.
