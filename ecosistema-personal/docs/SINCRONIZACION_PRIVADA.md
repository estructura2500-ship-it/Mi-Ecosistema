# Sincronización privada de Mi Ecosistema

Estado: **cliente publicado; base de datos pendiente de conectar**. Esto no significa que tus registros ya estén en la nube.

## Arquitectura
- GitHub Pages solo entrega las aplicaciones y el código público.
- Supabase Auth identifica al usuario.
- `public.app_snapshots` guarda un documento JSON por usuario y aplicación.
- Las políticas RLS permiten consultar y modificar únicamente el registro del usuario autenticado. El procedimiento RPC exige la revisión esperada para no sobrescribir silenciosamente cambios de otro equipo.
- Cuando no hay cuenta configurada, las apps continúan guardando localmente. Nunca se envían datos personales a GitHub.
- Las copias JSON antiguas son privadas y NO deben subirse al repositorio. **Finanzas está excluida**.

## Activar el backend (una vez)
1. Conecta **Supabase** en ChatGPT y crea/elige un proyecto propio en la cuenta que controlas.
2. En SQL Editor ejecuta el archivo `core/supabase-schema.sql`. Comprueba que **RLS esté activado** en `public.app_snapshots`.
3. En Authentication habilita el inicio de sesión por correo. Configura como Site URL `https://estructura2500-ship-it.github.io/Mi-Ecosistema/`. Si hay confirmación de correo habilitada, comprueba que los enlaces de confirmación estén configurados.
4. En el portal, abre **Mi cuenta**. Ingresa tu Project URL (debe terminar en `.supabase.co`) y únicamente la clave **publishable** o **anon** del proyecto, nunca la secret o service_role.
5. Crea tu cuenta o inicia sesión. El acceso es común a todas las apps en este mismo sitio.
6. Cuando se compruebe la conexión, se puede incorporar en la base de datos el respaldo privado de BRASA que ya proporcionaste. **No incrustes registros personales en ningún HTML público.**

La URL y la clave *pública* del proyecto pueden ponerse después como configuración predeterminada en `core/private-cloud.js`; una clave privada **jamás**.

## Cómo se sincroniza
- Los datos continúan guardándose inmediatamente en el navegador como antes.
- Con sesión iniciada, se sincronizan automáticamente los campos JSON en cambios, reconexión y apertura.
- Si el equipo no tiene registros pero la nube sí, se recupera el estado y se recarga la aplicación.
- Si una app encuentra dos versiones divergentes, se detiene para pedirte una decisión. No sobreescribe automáticamente la versión que difiere.
- Al recuperar una versión remota sobre otra local, se intenta descargar una copia de emergencia antes de recargar. Confirma que el navegador permitió esa descarga.
- Este sistema es una **sincronización de instantáneas**, no edición colaborativa simultánea; evita editar la misma app en dos equipos offline a la vez.
- Todos los datos se transmiten mediante HTTPS y se aíslan con RLS; **no** hay cifrado de extremo a extremo.
- Credenciales de sesión permanecen en almacenamiento local del navegador. Usa dispositivos de confianza; cierra sesión en equipos ajenos.

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
