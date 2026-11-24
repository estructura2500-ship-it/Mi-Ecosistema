# Mi Ecosistema

Portal PWA para Basketbrain, PULSO, Juego de Honor Skill Lab, Calistenia, Patinaje, ATLAS Fisioterapia y BRASA. Finanzas permanece en pausa y fuera del despliegue; Órbita continúa como extensión de navegador independiente.


## Portal

https://estructura2500-ship-it.github.io/Mi-Ecosistema/

El sitio se publica con GitHub Actions desde `ecosistema-personal/`. Cada cambio enviado a `main` vuelve a publicar el portal. Se puede instalar desde Chrome o Edge en Windows; los navegadores móviles compatibles permiten añadirlo a la pantalla de inicio.


## Privacidad

El repositorio contiene código estático sin progreso personal. No subir respaldos JSON, archivos de exportación ni fuentes originales con datos de uso incrustados. Las apps guardan los datos de forma local en el navegador y permiten restaurarlos desde sus respaldos privados. No hay sincronización de cuenta activa.


## Añadir una aplicación

Crea `ecosistema-personal/apps/<id>/index.html`, agrega sus metadatos a `app-manifest.js` y su ruta a la lista de caché de `sw.js`. Comprueba los cambios antes de publicar.
