# PULSO · Lista minimalista y dos relojes independientes

Actualización: **24 de noviembre de 2026**.

## Plan del día

- Cada fila muestra únicamente el **nombre de la tarea y su casilla de verificación**.
- Pulsa el nombre para abrir o cerrar los detalles de esa tarea, incluida la duración estimada, los registros de tiempo, los objetivos, el botón del temporizador, editar y reordenar.
- Las tareas se organizan por bloques horarios de forma compacta. Las completadas pueden ocultarse desde la parte superior.
- Los checks siguen guardándose en la clave original de PULSO y sincronizándose con la cuenta de Supabase.

## Temporizador clásico

- Al iniciar el temporizador de una tarea, la burbuja azul flotante se parece al **PULSO original**: reloj transcurrido grande a la izquierda, nombre de la actividad debajo y **Pausar / Guardar** a la derecha.
- Debajo del nombre se muestra discretamente **cuánto tiempo queda**.
- El menú **⋯** contiene: selección de actividad, 5/15/25/45/60 minutos o duración personalizada, reiniciar, borrar sin registrar y, si está disponible, una ventana Picture-in-Picture.
- Por defecto usa los minutos estimados de la tarea; si faltan, **15 minutos**.
- Guardar registra tiempo útil en PULSO. **Borrar sin guardar no suma minutos**.

## Cronómetro general

- En la barra de PULSO pulsa **⏱ Cronómetro** para iniciar un cronómetro que NO se asigna a una tarea.
- Se abre una segunda tarjeta flotante, independiente, con el mismo estilo clásico y sus propios botones Pausar / Guardar.
- **Temporizador y cronómetro pueden funcionar simultáneamente** sin que iniciar uno encienda el otro.
- El cronómetro general se registra en el área elegida en su menú ⋯ (Estructura por defecto) si decides guardarlo.
- Se puede reiniciar o borrar sin sumar minutos.

## Extensión opcional para Brave, Chrome y Edge

La extensión **PULSO · Temporizador clásico 1.2** presenta una burbuja compacta con el mismo diseño. Pulsa **⋯** para abrir la selección de la siguiente tarea, marcarla como completada, elegir la duración, reiniciar o descartar y consultar el cronómetro general. No hay botones de cronómetro dentro de las filas de las tareas.

La extensión se activa manualmente con su icono en una pestaña web. Necesita que otra pestaña de **PULSO** permanezca abierta para controlar, guardar y sincronizar los registros. No funciona sobre páginas internas `brave://`, el escritorio de Windows ni otras aplicaciones.

**Instalación:** descomprime el ZIP de la extensión v3, abre `brave://extensions`, activa modo desarrollador, desactiva la extensión PULSO anterior (evita duplicados) y selecciona «Cargar descomprimida».

## Privacidad

Los datos siguen en el navegador y en la cuenta de Supabase al iniciar sesión. El código del repositorio público no contiene los respaldos privados. La extensión solo conserva localmente metadatos de las tareas del día y de los relojes, no contraseñas ni respaldos completos.

Cuando los navegadores limitan la ejecución en segundo plano, el reloj se calcula usando la hora de inicio y la duración transcurrida para evitar desviaciones visuales al regresar.
