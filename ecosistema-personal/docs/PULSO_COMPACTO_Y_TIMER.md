# PULSO · Plan compacto y temporizador flotante

## Dónde está

- [Abrir PULSO](https://estructura2500-ship-it.github.io/Mi-Ecosistema/ecosistema-personal/apps/pulso/index.html)
- **Plan del día → ☷ Lista compacta** muestra todas las tareas agrupadas en sus bloques horarios y minimiza el espacio que ocupa cada una.
- **▤ Vista detallada** recupera el diseño anterior, con todos los campos, movimientos y registros. La elección se guarda en las preferencias de PULSO y se sincroniza con la cuenta.
- En la lista compacta se puede completar, iniciar o editar cada tarea. También se pueden reordenar con las flechas desde pantallas grandes o arrastrando en escritorio. «Ocultar completadas» elimina de la vista las tareas ya realizadas, no las borra.

## Cronómetro + cuenta regresiva

- Pulsa **▶** en cualquier tarea del plan, o **⏱ Timer** en la cabecera para una sesión libre.
- El widget aparece en PULSO de forma flotante. Muestra **nombre de la tarea, tiempo restante y cronómetro transcurrido**.
- Si la tarea tiene una estimación configurada, esa cantidad de minutos es la duración inicial del temporizador. De lo contrario el valor predeterminado es **15 minutos**.
- Puedes elegir 5, 15, 25, 45 o 60 minutos, o una duración personalizada de 1 a 240 minutos.
- El selector «Ver cronómetro / Ver cuenta regresiva» cambia el reloj principal; ambos tiempos siguen disponibles.
- Arrastra el botón **⠿** para mover el widget dentro de la página, o pulsa **—** para minimizarlo.
- Cuando el tiempo restante llega a cero, PULSO lo indica y trata de sonar una alerta. Si el navegador bloquea el audio en segundo plano, la alerta sonora puede no reproducirse. **La sesión continúa contando hasta que la guardes**.
- Al pulsar **Guardar**, PULSO sigue usando su formulario existente para registrar tiempo útil y minutos no productivos. No se duplican sesiones.

## Ventana siempre visible (si el navegador lo admite)

En el widget de PULSO pulsa **↗**. Si tu navegador admite **Document Picture-in-Picture**, aparecerá una miniventana independiente que puede permanecer encima de otras ventanas del escritorio. La pestaña de PULSO debe seguir abierta. Si el navegador no admite esta función, utiliza la extensión descrita abajo.

## Extensión para Brave, Chrome y Edge

La extensión opcional **PULSO · Minitemporizador flotante** permite mostrar el mismo temporizador encima de la página web que elijas.

- Instala el archivo ZIP de la extensión desde tu paquete de descarga, descomprimiéndolo primero; después visita `brave://extensions`, `chrome://extensions` o `edge://extensions`, habilita Modo desarrollador y pulsa «Cargar descomprimida».
- Abre PULSO desde el portal y comienza una sesión; después abre otra pestaña web y pulsa el icono de la extensión.
- La extensión no lee el contenido de las otras páginas. Solo se inserta cuando haces clic en su icono en esa pestaña.
- La pestaña de PULSO debe seguir abierta para que los botones Pausar, Continuar y Guardar controlen su sesión real.
- Si necesitas el reloj en varias pestañas, haz clic en el icono de la extensión en cada una.
- No funciona sobre pestañas internas del navegador (como `brave://`) ni sobre el escritorio de Windows. Para verlo encima de otras aplicaciones usa la ventana Picture-in-Picture cuando sea compatible.

## Privacidad y respaldo

Esta versión reutiliza la clave existente `pulso_life_os_v2_datos_migrados_20261110` y añade preferencias y campos del temporizador compatibles con los datos anteriores. La extensión recibe **solo el nombre de la tarea y metadatos del temporizador**, almacenados en su almacenamiento local; nunca necesita una clave de Supabase, el respaldo completo ni permisos para leer todas las webs.

Los datos completos de PULSO se siguen guardando en el navegador y en Supabase si has iniciado sesión. No se publican respaldos personales en GitHub.
