# Navegación lateral de ATT&CK LAB

El menú lateral de ATT&CK LAB se agrupa en siete categorías plegables. Los grupos utilizan elementos HTML nativos `details` y `summary`: se pueden abrir y cerrar con ratón o teclado sin scripts específicos.

| Grupo | Vistas |
| --- | --- |
| Aprendizaje / Learning | `dashboard`, `learn`, `courses`, `academy`, `practice`, `training`, `review`, `explain` |
| MITRE ATT&CK | `explore`, `chains`, `visual` |
| Investigaciones / Cases | `missions`, `integrated`, `decisions`, `caseacademy`, `incidents`, `investigations`, `labs` |
| SOC y detección / Detection | `telemetry`, `siem`, `queries`, `correlation`, `detection`, `hunting`, `response` |
| Análisis forense / Forensics | `network`, `networkcases`, `malware`, `memorylab`, `forensics` |
| Herramientas / Expert tools | `expert`, `toolkit` |
| Recursos / Resources | `help`, `favorites`, `about` |

## Comportamiento y mantenimiento

- Al cargar, **Aprendizaje** y **MITRE ATT&CK** aparecen desplegados; los demás grupos están contraídos.
- Al navegar a una vista, `app.js` expande automáticamente su categoría, incluso al cambiar de sección desde otros componentes.
- Las categorías se pueden expandir o contraer de forma independiente y respetan los estilos SVG monocromáticos incorporados anteriormente.
- El menú móvil sigue usando el control original de abrir/cerrar la barra lateral.
- Al añadir nuevas secciones, incorporar cada botón `data-view` exactamente una vez al grupo correspondiente; conservar el identificador de la vista y comprobar navegación en móvil y teclado.

## Verificación

Revisar que se puede acceder a todas las vistas, que la categoría de la vista activa se abre, que el menú móvil se cierra tras navegar y que no hay errores de consola. GitHub Actions comprueba sintaxis JS y rutas de recursos, pero no sustituye estas pruebas visuales.
