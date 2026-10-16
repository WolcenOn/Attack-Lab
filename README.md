# ATT&CK LAB — Academia de ciberseguridad defensiva

**Aprende a comprender, investigar y explicar comportamientos de ciberseguridad con MITRE ATT&CK, registros comentados y laboratorios simulados.**

ATT&CK LAB es un proyecto educativo independiente: combina lecciones, misiones empresariales, investigaciones SOC, telemetría, forense digital y prácticas de herramientas defensivas. **No es un servicio oficial de MITRE ni una certificación profesional.**

## Empezar

- **Historial MITRE:** consulta 28 transiciones entre versiones desde la sección Aprendizaje → Historial MITRE. [Metodología](docs/MITRE_HISTORIAL.md).
- **Web publicada (si GitHub Pages está habilitado):** https://wolcenon.github.io/Attack-Lab/
- **En local:** descarga el repositorio, mantén los archivos juntos y abre `index.html`.
- Si el navegador limita peticiones desde archivos locales, inicia un servidor estático con `python -m http.server 8000` y abre http://localhost:8000.
- El modo demostración es parcial; la carga del catálogo completo de MITRE requiere Internet.

## Qué puedo aprender

| Área | Qué encontrarás |
| --- | --- |
| MITRE ATT&CK | Tácticas, técnicas, subtécnicas y explicaciones |
| Biblioteca MITRE local v20 | 5.451 entradas consultables desde el repositorio (T, S, TA, DET, AN, DC, A, C, M); enlaces de procedencia, borradores en español |
| Evidencias explicadas · Txxxx | Carga automática de MITRE Enterprise con caché local, glosario bilingüe y fichas introductorias |
| Formación | Itinerarios, microlecciones, glosario y preguntas razonadas |
| **ASIR 2.º** | Ruta técnica complementaria: sistemas, redes, web, SGBD y seguridad/alta disponibilidad, con prácticas enlazadas |
| Investigación | Casos históricos documentados, misiones y laboratorios simulados |
| SOC y detección | SIEM educativo, correlación, Threat Hunting y reglas de detección |
| Forense y respuesta | Memoria, malware, red, evidencias y decisiones de contención |
| Modo experto | Comandos comentados y salidas ficticias para aprender a interpretarlas |

La sección **Catálogos MITRE** incorpora también **191 grupos Gxxxx** con vínculos documentados a T/S/C, búsquedas por alias y navegación bidireccional. La sección **Catálogos MITRE** carga sus índices y fichas desde `data/mitre/v20/` al entrar en ella; no requiere bajar el archivo STIX completo. El explorador ATT&CK tradicional mantiene su flujo independiente de sincronización oficial. Las traducciones pendientes se identifican expresamente.

## Documentación

- [Índice de guías](docs/README.md)
- [Integrar más archivos MITRE en el directorio](docs/MITRE_LOCAL.md)
- [Guía del alumno](docs/GUIA_DEL_ALUMNO.md)
- [Ruta de apoyo para 2.º de ASIR](docs/ASIR_2.md)
- [Arquitectura y mapa de módulos](docs/ARQUITECTURA.md)
- [Cómo redactar contenido educativo](docs/CONTENIDO_EDUCATIVO.md)
- [Cómo contribuir](docs/CONTRIBUIR.md)
- [Historial descriptivo anterior](docs/HISTORIAL_VERSIONES.md)

## Tecnología y estructura actual

Aplicación estática con `index.html`, `styles.css` y módulos JavaScript en la raíz. Las rutas se mantienen por compatibilidad con la publicación existente. La documentación describe una estructura futura, **no una migración ya realizada**.

Para comprobar sintaxis y referencias locales, ejecuta `python3 scripts/check_project.py` (requiere Python 3 y Node.js). Los Pull Requests ejecutan estas comprobaciones mediante GitHub Actions.

## Seguridad, fuentes y límites

- Los registros y salidas de la mayoría de laboratorios son **simulados**; no deben confundirse con evidencias de incidentes reales.
- Las terminales didácticas y ejemplos de consultas **no ejecutan herramientas reales**.
- Las preguntas automáticas comprueban respuestas definidas; los informes narrativos requieren revisión humana.
- La interfaz dispone de español e inglés, pero no todo el material oficial de MITRE está traducido.
- Realiza prácticas únicamente en entornos propios o con autorización expresa.
- Consulta los informes originales cuando se presentan incidentes históricos; distingue hechos documentados de mapeos analíticos.

## Licencia

Consulta [LICENSE](LICENSE) para los términos del repositorio. MITRE ATT&CK y la documentación de terceros conservan sus respectivas atribuciones.
