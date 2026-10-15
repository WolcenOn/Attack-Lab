# Arquitectura y mapa de módulos

## Estado actual

Aplicación web estática, sin servidor de aplicación obligatorio. La raíz contiene `index.html`, `styles.css`, un conjunto de módulos `.js`, `data.js` y una PCAP educativa. **Migración incremental en curso:** los bloques experto, aprendizaje y SOC se ubican en `src/features/expert/`, `src/features/learning/` y `src/features/soc/`; otros módulos siguen en la raíz.

## Punto de entrada

- `index.html`: estructura HTML, navegación, contenedores de vistas e inclusión de scripts.
- `styles.css`: estilos de interfaz.
- `app.js`: lógica principal de exploración y coordinación de la aplicación; revisar dependencias antes de modificar.
- `data.js`: datos de demostración y contenido relacionado con ATT&CK.

## Mapa orientativo por responsabilidad

El mapa siguiente se basa en los nombres y la estructura de navegación; **no es una documentación línea por línea de las interfaces internas**.

| Área | Archivos |
| --- | --- |
| Aprendizaje y orientación | `src/features/learning/`: `onboarding.js`, `dashboard.js`, `courses.js`, `asir2.js`, `lessons.js`, `didactics.js`, `explained.js`, `review.js`, `training.js` |
| ATT&CK y recorridos | `subtechniques.js`, `attackchains.js`, `visualinvestigation.js` |
| Casos y misiones | `incidents.js`, `caseacademy.js`, `investigations.js`, `missions.js`, `decisions.js`, `labs.js` |
| Operaciones SOC | `src/features/soc/`: `siem.js`, `queries.js`, `hunting.js`, `correlation.js`, `detection.js`, `response.js` |
| Telemetría y forense | `telemetry.js`, `network.js`, `networkcases.js`, `forensics.js`, `memorylab.js`, `malwarelab.js` |
| Práctica experta | `src/features/expert/expert.js`, `src/features/expert/toolkit.js`, `src/features/expert/integrated.js` |
| Recurso de práctica | `network-training-v24.pcap` |

### Límites técnicos

- La interfaz usa carga de datos locales y, para el catálogo oficial completo, recursos externos.
- Un módulo que muestra comandos o salidas educativas no ejecuta necesariamente herramientas reales.
- Si se cambia el nombre o la ubicación de un archivo, hay que actualizar las etiquetas `script`, `link`, las rutas relativas de recursos y las referencias internas.

## Estructura objetivo (aplicación parcial)

```text
/
  index.html
  README.md
  docs/
  assets/
    css/
    pcap/
  src/
    core/
    content/
    features/
      attack/
      learning/
      soc/
      forensics/
      expert/
  tests/
```

La migración debería hacerse en PRs pequeños, con una verificación de rutas, comprobación de sintaxis, carga de páginas y pruebas de navegación. Evita trasladar todos los archivos en una sola operación.

## Lista mínima de revisión de cambios

1. ¿Se mantiene el punto de entrada `index.html`?
2. ¿Cargan todos los scripts y recursos con rutas correctas?
3. ¿Hay errores de consola o funciones que se cargan fuera de orden?
4. ¿Se preservan los identificadores de vistas (`data-view`) y la navegación?
5. ¿Los datos sintéticos se identifican como tales?
6. ¿Se mantienen las explicaciones ES/EN que existían?
7. ¿Sigue disponible la funcionalidad sin conexión prometida?

## Primera migración de módulos

Los tres archivos expertos se mueven sin modificar su contenido: `expert.js`, `toolkit.js` e `integrated.js` → `src/features/expert/`. El HTML cambia solo sus rutas de carga y mantiene su orden. El validador ahora recorre subdirectorios para no omitir archivos.

La prueba de sintaxis no verifica todas las interacciones del navegador; comprueba GitHub Actions y prueba las secciones expertas antes de fusionar.

## Segunda migración: aprendizaje

Se han agrupado ocho módulos educativos en `src/features/learning/` sin modificar sus contenidos. `index.html` conserva el orden original de carga. La comprobación estática recursiva agregada en el PR anterior cubre ahora ambas carpetas. Verificar manualmente el menú, bienvenida, dashboard, itinerarios, lecciones, biblioteca y repaso antes de fusionar.

## Tercera migración: operaciones SOC

Se han agrupado seis módulos relacionados con SIEM, consultas, Threat Hunting, correlación, detección y respuesta a incidentes en `src/features/soc/`, manteniendo su contenido y orden original de ejecución. `index.html` actualiza exclusivamente sus rutas. El validador recursivo comprobará su sintaxis y presencia. Antes de fusionar, probar las secciones SOC y las consultas en navegador, verificar CI y GitHub Pages.

## Ruta ASIR 2.º

La vista `asir2View` se carga desde `src/features/learning/asir2.js` y ofrece dieciséis unidades bilingües sobre los cinco módulos técnicos 0374–0378. Sus botones de prácticas utilizan los `data-view` existentes y el progreso individual se guarda en `localStorage` (`attacklab-asir2-v1`). Véase `docs/ASIR_2.md`.
