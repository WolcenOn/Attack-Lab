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
| G — Grupos de actividad documentados | 191 |
| **Entradas de búsqueda** | **5.692** |

Los datos proceden de archivos **aportados por el usuario**, capturas HTML del sitio MITRE ATT&CK de octubre de 2026, junto con extracciones estructuradas previas del mismo material. Los JSON **no son un feed en vivo**: conservan nombres/descripciones oficiales en inglés y relaciones explícitas; no se ha inferido qué software empleó una técnica si la página no lo documentaba.

## Disposición

- `manifest.json`: colección, versión, conteos y archivos disponibles
- `index-00.json` a `index-05.json`: búsqueda rápida de IDs con referencia al archivo que contiene su ficha
- `links.json`: enlaces explícitos desde técnicas a estrategias, software, mitigaciones, campañas y activos
- `group-links.json`: referencias documentadas desde técnicas a grupos G
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

## Grupos G (nueva colección del archivo `groups.rar`)

Se han revisado 196 páginas `Gxxxx` del archivo recibido: **191 fichas con contenido** y **5 redirecciones HTML** (`G0042`, `G0057`, `G0058`, `G0074`, `G0086`). Las cinco redirecciones no se han convertido en fichas nuevas ni se han contado como grupos actuales.

La colección `groups-*.json` conserva nombre original, descripción inglesa de la página, alias, fecha y versión cuando aparecen, y las relaciones explícitas con técnicas (`Txxxx`), software (`Sxxxx`) y campañas (`Cxxxx`). `group-links.json` permite el recorrido inverso desde una técnica a los grupos que MITRE menciona. Los enlaces se han recogido de las tablas documentadas de cada ficha; **no se ha inferido autoría ni atribución independiente**. La capa Navigator de los originales no se duplica: sus técnicas quedan representadas en JSON navegable.

En total se han extraído **7.373 enlaces grupo–técnica** (contando técnicas y subtécnicas tal como se documentan), además de 1.195 referencias a software y 27 a campañas; son relaciones en páginas, no observaciones independientes. Las descripciones continúan en inglés hasta que exista traducción española revisada y muestran el estado pendiente. El catálogo se puede filtrar por G y saltar de técnica a grupo, y de grupo a técnica, software o campaña.

`datacomponents(1).rar` y `datasources(1).rar` se han identificado como segundas copias de las mismas 120 fichas DC y 42 fichas DS ya incorporadas en el PR #20, por lo que no se han cargado duplicados. `wiki.rar` contiene siete redirecciones antiguas de técnica sin fichas originales nuevas.

## Última captura `attack.mitre.org.rar`: matrices y formación

El archivo aportado contiene 370 elementos (páginas HTML y recursos visuales), pero la mayor parte son recursos duplicados del sitio. Se han integrado **18 matrices de plataforma** y **12 guías oficiales de aprendizaje** como índices pequeños, sin copiar imágenes, tipografías ni páginas HTML completas al repositorio.

- `platform-matrices.json`: tecnologías y plataformas Enterprise, Mobile e ICS, con códigos de técnicas que aparecen en la matriz v20. Se ofrecen filtros de Windows, Linux, macOS, ESXi, contenedores, dispositivos de red, nube, Android, iOS y sistemas ICS. Los números son **identificadores distintos en la matriz**, no estadísticas de incidentes.
- `study-resources.json`: enlaces a guías oficiales MITRE sobre CTI, detección, ingeniería defensiva, emulación autorizada, fundamentos, hunting, SOC, formatos de datos y notas de versión. Incluye resúmenes didácticos propios en español/inglés, **no traducciones oficiales literales**.

### Auditoría de analíticas (2283 frente a 2268)

La página `analytics/index.html` de la captura registra **2.283 analíticas AN únicas**; las fichas de estrategias DET ya importadas reunían **2.268 AN únicas**. La diferencia se guarda en `analytics-appendix.json` y se indexa mediante `index-06.json`, sin duplicar las analíticas existentes.

**AN0667–AN0670** aparecen vinculadas a DET0239 y **AN0886–AN0894** a DET0317. Las dos entradas **AN2070** y **AN2074** no tienen una asociación DET en la página de índice aportada y se muestran con aviso: no se ha supuesto cuál debería ser. Ninguna de estas 15 analíticas lleva traducción española revisada todavía.

Las fuentes y matrices son una instantánea v20, no garantizan que los datos sigan iguales en la web oficial. La academia muestra siempre enlaces a la página de origen para contraste.

## Capa de traducción española v20 — lote 1

El fichero `src/features/learning/mitre-es-v20.js` añade un glosario **independiente** de los JSON de MITRE, que se preservan intactos. Incluye **383 equivalencias por código de técnica principal** y un glosario de **509 entradas de términos de subtécnicas** (con algunas repetidas entre lotes), suficientes para ofrecer un borrador español de los **935 nombres Txxxx/Txxxx.xxx** presentes en esta captura v20; **71 términos de mitigación** que cubren los **109 títulos Mxxxx**, y **34 resúmenes defensivos originales en español**. También reutiliza resúmenes redactados previamente en `AttackTranslations` cuando procede.

**Importante:** los títulos y resúmenes nuevos son **borradores educativos pendientes de revisión**; no traducciones oficiales ni una traducción literal y completa de las descripciones de MITRE. La interfaz distingue esta situación de las fichas con traducción revisada, conserva siempre el texto fuente en inglés y lo restaura al cambiar a ese idioma. Las fichas con traducciones existentes en los JSON mantienen prioridad y su estado original.

El buscador del catálogo local encuentra códigos, títulos originales, títulos españoles disponibles y alias. Se ha añadido un filtro de cobertura («Todas», «Título español disponible», «Título pendiente»), con contador sobre los índices v20. Una subtécnica sin sufijo conocido sigue mostrando el título inglés completo: **nunca se completa a medias con una traducción inventada**.

**Próximos lotes:** traducir más subtécnicas exactas, mitigaciones y componentes, priorizar descripciones oficiales revisadas y estrategias DET/AN. Un resumen educativo redactado a partir del conocimiento técnico no debe etiquetarse como traducción literal del párrafo MITRE.

### Cobertura comprobable

Se ha probado que los 706 títulos T de Enterprise, los 125 de Mobile, los 104 de ICS y los 109 M del archivo archivado tienen un borrador español disponible mediante `AttackSpanishV20.translate`. Esta cobertura se refiere **exclusivamente a los nombres**, no a las 935 descripciones originales ni a DET, AN, S o G. La exportación original inglesa no se altera. Se añade un test de regresión de cobertura que fallará si la siguiente instantánea incorpora un ID que todavía no tenga equivalente completo.
