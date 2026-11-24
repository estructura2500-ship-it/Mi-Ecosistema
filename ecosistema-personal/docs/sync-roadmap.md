# Preparación para sincronización futura

Hoy cada módulo utiliza el almacenamiento local del navegador y no transmite datos. El futuro inicio de sesión debe añadirse como servicio separado: autenticación, almacenamiento remoto por usuario, reglas de acceso, cifrado en tránsito y proceso de resolución de conflictos. Los módulos conservarán un adaptador local y podrán migrarse de uno en uno a un contrato común (`load`, `save`, `export`, `import`). No se configuró un proveedor ni se subieron datos personales.
