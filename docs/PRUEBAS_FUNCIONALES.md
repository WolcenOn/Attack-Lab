# Pruebas funcionales con Playwright

Las pruebas E2E comprueban la **interacción real en Chromium** con la web servida localmente. Complementan las validaciones estáticas de `scripts/check_project.py`.

## Requisitos

- Node.js 22 y Python 3.
- En la raíz del repositorio: `npm install`, `npx playwright install chromium` y `npm run test:e2e`.
- Para ver el navegador: `npm run test:e2e:headed`.

## Qué se prueba

- Cambios de vistas y navegación de las 35 secciones.
- Acordeones y apertura automática de la categoría activa.
- Cambio de idioma español/inglés.
- Ausencia de excepciones JS durante interacciones representativas.
- Menú móvil, apertura y cierre al navegar.

Los tests no usan el catálogo MITRE remoto ni servicios externos; verifican el modo demostración sin conexión. El workflow ejecuta pruebas en Chromium de escritorio y emulación móvil.

## Limitaciones

No se garantiza la validez pedagógica del contenido ni se inspecciona visualmente cada módulo. No sustituyen pruebas de accesibilidad exhaustivas ni una revisión humana de respuestas. Las capturas y trazas ante fallos se pueden consultar en los artefactos del workflow.

## Diagnóstico

Si una prueba falla, abre el workflow en GitHub Actions. Revisa el mensaje de la prueba y descarga `playwright-report` si se publicó. Para corregirla, reproduce localmente antes de modificar la aplicación.
