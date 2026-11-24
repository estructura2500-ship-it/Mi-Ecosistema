# Mi Ecosistema · Aplicaciones personales

Portal PWA para Basketbrain, PULSO, Juego de Honor Skill Lab, Calistenia, Patinaje, ATLAS Fisioterapia y BRASA. **Finanzas no se publica**. Órbita sigue siendo una extensión de navegador independiente.

## Abrir el portal

[Mi Ecosistema — GitHub Pages](https://estructura2500-ship-it.github.io/Mi-Ecosistema/ecosistema-personal/)

El sitio se publica mediante GitHub Actions desde la carpeta `ecosistema-personal/`. Todas las aplicaciones mantienen sus diseños y funcionalidades independientes. Puedes instalar el portal con un navegador compatible.

## Almacenamiento y privacidad

- El código es público; los **datos privados están en Supabase**, asociados a una cuenta verificada y sujetos a Row Level Security (RLS).
- En cualquier aplicación, pulsa **☁ Mi cuenta** para iniciar sesión o sincronizar. En el portal, **☁ Mi cuenta → Estado de mis aplicaciones** muestra cuáles tienen una copia en la nube.
- Los datos locales continúan disponibles en tu navegador y se pueden exportar mediante los respaldos JSON originales.
- Si existen cambios incompatibles en dos dispositivos, se muestra un aviso antes de sobreescribir uno de ellos.
- La base conserva automáticamente hasta **14 copias de recuperación, una por día con cambios**, por aplicación y cuenta. Desde una aplicación abre **☁ Mi cuenta → Copias anteriores** para descargarlas o restaurarlas.
- Si cierras sesión, **los registros locales no se borran**. Cierra sesión y usa un perfil privado del navegador para evitar que otros usuarios del mismo equipo vean tus datos.
- No se sincronizan necesariamente archivos multimedia almacenados en IndexedDB por las aplicaciones. Los respaldos JSON y las copias de archivos multimedia siguen siendo importantes.

## Proyecto privado

[Supabase — Mi Ecosistema Privado](https://supabase.com/dashboard/project/lrwiqqkcwsizrbtytbqw)

- `ecosistema-personal/core/supabase-schema.sql`: tabla privada, RLS y guardado con revisión.
- `ecosistema-personal/core/supabase-history.sql`: copias diarias privadas y su retención.
- `ecosistema-personal/core/private-cloud.js`: cliente web de autenticación y sincronización.
- `ecosistema-personal/docs/SINCRONIZACION_PRIVADA.md`: configuración, procedimientos y límites.

**Nunca publiques** credenciales administrativas o claves secret, respaldos JSON, extractos, información de usuarios ni HTML que tenga registros personales incorporados. En el navegador solo se publica la clave de tipo `publishable`, protegida por las políticas de acceso de la base.

## Añadir aplicaciones

Crea `ecosistema-personal/apps/<id>/index.html`, registra su ficha en `app-manifest.js`, su almacenamiento en `core/private-cloud.js` y sus archivos en `sw.js`. Comprueba la exportación, la restauración, la privacidad y las pruebas de sincronización antes de publicarla.

## Estado

Cuatro respaldos privados cargados y verificados en Supabase: BRASA, Basketbrain, Juego de Honor Skill Lab y PULSO. Las otras aplicaciones están preparadas para sincronizar sus datos locales cuando se abran con sesión iniciada. Todavía falta una prueba completa de recuperación desde un segundo dispositivo; no asumas que todos los datos multimedia se sincronizan.
