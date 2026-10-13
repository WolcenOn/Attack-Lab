# Arquitectura y mapa de módulos

## Estado actual

Aplicación web estática, sin servidor de aplicación obligatorio. La raíz contiene `index.html`, `styles.css`, un conjunto de módulos `.js`, `data.js` y una PCAP educativa. **No se ha realizado aún una refactorización de carpetas**, para evitar romper referencias y la publicación.

## Punto de entrada

- `index.html`: estructura HTML, navegación, contenedores de vistas e inclusión de scripts.
- `styles.css`: estilos de interfaz.
- `app.js`: lógica principal de exploración y coordinación de la aplicación; revisar dependencias antes de modificar.
- `data.js`: datos de demostración y contenido relacionado con ATT&CK.

## Mapa orientativo por responsabilidad

El mapa siguiente se basa en los nombres y la estructura de navegación; **no es una documentación línea por línea de las interfaces internas**.

| Área | Archivos |
| --- | --- |
| Aprendizaje y orientación | `onboarding.js`, `dashboard.js`, `courses.js`, `lessons.js`, `didactics.js`, `explained.js`, `review.js`, `training.js` |
| ATT&CK y recorridos | `subtechniques.js`, `attackchains.js`, `visualinvestigation.js` |
| Casos y misiones | `incidents.js`, `caseacademy.js`, `investigations.js`, `missions.js`, `integrated.js`, `decisions.js`, `labs.js` |
| Operaciones SOC | `siem.js`, `queries.js`, `hunting.js`, `correlation.js`, `detection.js`, `response.js` |
| Telemetría y forense | `telemetry.js`, `network.js`, `networkcases.js`, `forensics.js`, `memorylab.js`, `malwarelab.js` |
| Práctica experta | `expert.js`, `toolkit.js` |
| Recurso de práctica | `network-training-v24.pcap` |

### Límites técnicos

- La interfaz usa carga de datos locales y, para el catálogo oficial completo, recursos externos.
- Un módulo que muestra comandos o salidas educativas no ejecuta necesariamente herramientas reales.
- Si se cambia el nombre o la ubicación de un archivo, hay que actualizar las etiquetas `script`, `link`, las rutas relativas de recursos y las referencias internas.

## Propuesta de estructura futura (NO aplicada)

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
