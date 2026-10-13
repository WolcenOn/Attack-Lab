# Guía del alumno

## ¿Qué es ATT&CK LAB?

Una web educativa para aprender ciberseguridad defensiva: cómo describir comportamientos de atacantes, interpretar evidencias, formular hipótesis, validar detecciones y documentar una respuesta. No es una herramienta para atacar redes, un SIEM real ni una certificación oficial.

## Cómo empezar

1. Abre la web desde GitHub Pages (si el propietario ha activado la publicación) o abre `index.html` en el navegador.
2. Usa el selector de idioma de la barra superior; algunas fuentes o explicaciones oficiales pueden permanecer en inglés.
3. Lee **Ayuda** y consulta **Mi aprendizaje** para orientarte.
4. Si partes de cero, visita **Itinerarios formativos** y **Lecciones guiadas** antes de los laboratorios.
5. Después practica con **Misiones formativas**, **Laboratorios SOC** y **Repaso razonado**.
6. Para profundizar utiliza **Consola SIEM**, **Threat Hunting**, **Ingeniería de detección**, **Investigación integrada** y **Modo experto**.

## Mapa rápido: ¿dónde aprendo cada cosa?

| Sección | Pregunta que ayuda a responder |
| --- | --- |
| Explorar matriz | ¿Qué táctica, técnica o subtécnica ATT&CK estoy estudiando? |
| Biblioteca explicada / Registros explicados | ¿Qué significa cada dato y por qué podría importarme? |
| Incidentes reales | ¿Qué campañas o incidentes están documentados y con qué fuentes? |
| Misiones / Expedientes ampliados | ¿Cómo investigo un escenario con contexto empresarial? |
| Consola SIEM / Consultas explicadas | ¿Cómo filtrar y relacionar eventos? |
| Threat Hunting / Correlación | ¿Cómo comprobar hipótesis y considerar explicaciones alternativas? |
| Respuesta ante incidentes / Forense | ¿Cómo preservar, contener, recuperar y justificar decisiones? |
| Modo experto / Laboratorio de herramientas | ¿Qué comandos se usan y cómo se interpreta una salida? |

## Método de estudio recomendado

Para cualquier técnica sigue este ciclo:

**Concepto → contexto → datos → hipótesis → corroboración → defensa → pregunta razonada → fuentes.**

Ejemplo: si Word inicia PowerShell, el hecho observado es una relación padre-hijo entre procesos. Podría justificar una investigación; por sí solo no demuestra malware. Busca argumentos, usuario, actividad posterior y contexto administrativo antes de concluir.

## Datos, privacidad y limitaciones

- Muchos laboratorios utilizan eventos y salidas **simulados**. No son evidencias forenses de incidentes reales.
- Los simuladores de terminal y consultas no son equivalentes a ejecutar herramientas reales.
- El progreso y los apuntes de determinados módulos se guardan localmente en el navegador; puede perderse al borrar datos o cambiar de dispositivo. Utiliza las exportaciones cuando estén disponibles.
- La carga del catálogo completo de MITRE requiere acceso a Internet; el modo demostración es parcial.
- Los ejercicios no sustituyen un plan real de respuesta ante incidentes.
- No pruebes comandos sobre equipos o redes sin autorización expresa.

## Si algo no funciona

- Comprueba que descargaste **todos** los archivos y conservaste las rutas.
- Al abrir localmente, algunas peticiones del navegador pueden estar restringidas. Como alternativa, desde la carpeta del proyecto: `python -m http.server 8000` y visita `http://localhost:8000`.
- Comprueba la consola del navegador (F12) si falta una sección o hay errores.
- Si un enlace externo falla, revisa la conectividad y consulta la fuente oficial directamente.
