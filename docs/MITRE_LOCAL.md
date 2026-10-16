# Importar catálogos MITRE al directorio de ATT&CK LAB

## Estado de la importación v20

La biblioteca ya incluye un catálogo **versionado** en `data/mitre/v20/`. No necesita copiar HTML de HTTrack ni utilizar un servidor de aplicación: la web estática consulta directamente esos JSON al entrar en **Aprendizaje → Catálogos MITRE**.

| Tipo | Registros |
| --- | ---: |
| T — Técnicas y subtécnicas | 935 (706 Enterprise, 125 Mobile, 104 ICS) |
| TA — Tácticas | 41 |
| S — Software documentado | 974 (incluye entradas obsoletas/redirecciones del archivo) |
| DET — Estrategias de detección | 933 activas en la instantánea |
| AN — Analíticas de detección | 2.268, vinculadas a DET |
| DC — Componentes de datos | 120 (8 incorporados) |
| A — Activos industriales | 18 |
| C — Campañas | 61 |
| M — Mitigaciones | 109 |
| DS — Fuentes de datos históricas obsoletas | 42 |
| **Entradas de búsqueda** | **5.501** |

Los datos proceden de archivos **aportados por el usuario**, capturas HTML del sitio MITRE ATT&CK de octubre de 2026, junto con extracciones estructuradas previas del mismo material. Los JSON **no son un feed en vivo**: conservan nombres/descripciones oficiales en inglés y relaciones explícitas; no se ha inferido qué software empleó una técnica si la página no lo documentaba.

## Disposición

- `manifest.json`: colección, versión, conteos y archivos disponibles
- `index-00.json` a `index-03.json`: búsqueda rápida de IDs con referencia al archivo que contiene su ficha
- `links.json`: enlaces explícitos desde técnicas a estrategias, software, mitigaciones, campañas y activos
- `techniques-*.json`, `software-*.json`, `tactics-*.json`: fichas originales
- `detections-*.json`: estrategias DET y sus analíticas AN, con fuentes DC y parámetros de ajuste
- `components-00.json` a `components-11.json`: 120 componentes DC con descripciones, canales de registro y vínculos DET/T
- `datasources-00.json`: 42 fuentes DS históricas, todas marcadas como obsoletas en sus páginas MITRE
- `assets-00.json`, `campaigns-00.json`, `mitigations-00.json`: nuevas colecciones

Los archivos se han dividido en fragmentos pequeños para acelerar consultas desde GitHub Pages. La interfaz **solo descarga índices al abrir la biblioteca**, y el fragmento de datos correspondiente al abrir una ficha.

## Español y calidad

Los campos en español se muestran como **borradores pendientes** hasta una revisión lingüística/técnica. Si no existe traducción se conserva el inglés original sin simular que está traducido. La fuente MITRE y la procedencia aparecen en la ficha. Los eventos o registros sintéticos de otras secciones de la academia no son hallazgos forenses ni ejemplos oficiales de MITRE.

## Cómo añadir material nuevo

1. Identificar tipo (`techniques`, `tactics`, `software`, `detections`, `assets`, `campaigns`, `mitigations`, etc.), dominio, versión y fecha de la fuente.
2. Extraer los **datos**, sin subir el archivo RAR ni copiar los HTML completos al repositorio. Preservar texto inglés, ID, versión y URLs oficiales.
3. Incorporar nuevos JSON `<tipo>-NN.json` al directorio de la **versión correcta**; no mezclar snapshots históricos.
4. Actualizar `manifest.json`, reconstruir los `index-NN.json` y las relaciones explícitas de `links.json`. Las entradas llevan `id`, `type`, `name_en`, `domain`, `shard`, y opcionalmente `name_es`, `translation_status`.
5. Ejecutar `python3 scripts/validate_mitre_v20.py` y Playwright. Abrir un PR sin fusionarlo antes de revisar fuentes, traducciones, integridad y navegación ES/EN.

Las páginas MITRE enlazadas pueden cambiar con el tiempo. Antes de incorporar otra versión se compararán los IDs añadidos, retirados, renombrados y las relaciones modificadas. Las **reglas DET/AN no están preparadas automáticamente para un SIEM de producción**.

## Licencia y atribución

**© 2026 The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation.**

Información y licencia: https://attack.mitre.org/resources/terms-of-use/ 

ATT&CK LAB es independiente de MITRE. Hay que mantener esta atribución al redistribuir sus datos.

## Componentes DC y fuentes históricas DS (actualización v20)

Los archivos `datacomponents.rar` y `datasources.rar` suministrados incorporan 120 fichas DC y 42 fichas DS, respectivamente. **Se han añadido ocho DC al índice que anteriormente solo incluía 112**, preservando los vínculos DET/AN anteriores. De los 120 componentes se han extraído **3.832 filas de fuentes y canales** y sus relaciones publicadas con técnicas y estrategias.

Las **42 páginas DS incluyen el aviso «Deprecation Warning» de MITRE** y permanecen disponibles únicamente como referencia histórica. No se han supuesto equivalencias DS → DC ni se consideran fuentes vigentes. La interfaz etiqueta estos registros de manera visible en español e inglés.

En las fichas DC se muestran hasta 24 fuentes/canales y se enlaza a MITRE para el conjunto completo. No son eventos de un SIEM real ni una regla lista para producción. La traducción española sigue siendo progresiva: se han añadido 15 títulos y explicaciones de DC y 11 denominaciones DS como **borradores pendientes de revisión**; los nombres y descripciones oficiales en inglés se conservan.

## Historial de versiones

Las fichas de v20 y sus relaciones se mantienen separadas del nuevo [historial de cambios v7.2→v20.0](MITRE_HISTORIAL.md). Un cambio registrado en una versión no equivale a la situación actual de ese identificador.
