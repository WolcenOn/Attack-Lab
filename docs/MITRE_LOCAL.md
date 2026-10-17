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

## Primer lote educativo DET/AN en español (posterior al PR #24)

Se incorpora un glosario separado de los originales (`src/features/learning/mitre-det-an-es-v20.js`), cargado antes de la biblioteca local. Contiene **18 estrategias DET** con título, resumen, señales, fuentes que investigar, limitaciones de interpretación y pregunta razonada; y **35 analíticas AN** con título descriptivo, explicación y orientación de comprobación para ASIR.

- **Cobertura nueva de este glosario:** 18/933 estrategias DET (1,93 %) y 35/2.283 analíticas AN (1,53 %). Son fichas educativas, **no** traducciones literales completas de la documentación de MITRE ni una medición de todos los campos de la fuente. Puede haber otros títulos y resúmenes españoles anteriores guardados en los JSON.
- **Estado:** todos los textos del glosario son propuestas pendientes de revisión humana. No deben etiquetarse como revisados u oficiales. Las fuentes, nombres de campos, IDs, expresiones y definiciones originales de parámetros continúan en inglés.
- **Interfaz:** los títulos españoles participan en los resultados y filtros de búsqueda; los términos explicativos del glosario también son buscables. En ES se muestra la guía educativa junto al original MITRE. Al seleccionar EN se ocultan las guías propias y se mantienen el nombre y la explicación ingleses. En las analíticas se incluyen parámetros originales y, cuando existe, consejo didáctico de ajuste en español.
- **Alcance educativo:** administración Windows/Linux, cuentas de dominio, servicios cloud, MFA, PowerShell, RDP, procesos, phishing, movimiento lateral, memoria sensible y fuerza bruta. Las estrategias y las analíticas no son reglas de SIEM listas para producción; requieren validar disponibilidad de logs, umbrales y casos legítimos.
- **Fuentes inalteradas:** los JSON de `data/mitre/v20/`, las asociaciones DET→AN y los eventos técnicos no se modifican.

Una búsqueda que no tenga borrador español seguirá mostrando el original inglés con estado de traducción pendiente. El siguiente lote debería ampliar las analíticas de las estrategias ya tratadas, junto con DC para hacer más clara la obtención real de telemetría.

## Segundo lote educativo DET/AN y relación con telemetría DC

El PR posterior al #25 amplía los borradores con **48 analíticas AN** y **una nueva estrategia DET (`DET0460`)**. Completa las explicaciones educativas de las analíticas vinculadas a las 18 estrategias priorizadas en el lote anterior, más las de `DET0070`, `DET0126`, `DET0210` y `DET0460`: 22 estrategias con todas sus AN asociadas cubiertas por el glosario educativo.

- **Cobertura educativa nueva del segundo lote:** +1 DET y +48 AN.
- **Cobertura total de glosarios específicos, tras los dos lotes:** 19/933 DET (2,04 %) y 83/2.283 AN (3,64 %). Los 28 DET con títulos y resúmenes españoles presentes originalmente en JSON son adicionales: **47/933 DET (5,04 %)** con título y resumen educativos españoles en total. El conteo de AN no incluye supuestas traducciones de las descripciones inglesas originales: son explicaciones educativas propias.
- **Precisión del estado:** los nuevos textos son borradores pendientes de revisión, no traducciones oficiales, ni detecciones verificadas ni recetas listas para SIEM. El catálogo original no se edita.
- **Búsqueda y navegación:** desde las fuentes de log de una AN se puede abrir su componente DC, cuando está indexado. Las fichas DC permiten volver a sus analíticas relacionadas y priorizan en la lista los IDs con guía española, sin ocultar los demás. Se mantiene la navegación entre técnicas T y estrategias DET existente.
- **Guía de telemetría para ASIR:** cinco componentes (`DC0002`, `DC0032`, `DC0064`, `DC0067`, `DC0082`) muestran propósito, ejemplos de dónde consultar registros y límites de interpretación. Estos ejemplos dependen de la configuración de auditoría y no deben confundirse con canales presentes o eventos recogidos realmente.
- **Idiomas:** los comentarios y explicaciones propias aparecen únicamente en español. Al seleccionar inglés se mantienen los nombres y descripciones originales, los campos técnicos y las fuentes MITRE. Los identificadores de logs, comandos, rutas y los vínculos de origen no se traducen ni alteran.

Pruebas de regresión: el catálogo debe comprobar todos los IDs del lote contra los datos locales, las relaciones DET/AN/DC, la cobertura del glosario, búsqueda en español y el cambio ES→EN→ES en escritorio y móvil.

## Traducción progresiva de todo el catálogo: lote DC, DS y activos ICS

El glosario separado `src/features/learning/mitre-es-v20-catalog-extension.js` cubre con títulos españoles **los 120 componentes DC**, **las 42 fuentes históricas DS** y **los 18 activos industriales A**. Las tácticas TA ya tenían título y resumen en español para sus 41 registros. El glosario nuevo no reescribe los JSON de MITRE ni sustituye títulos españoles existentes; añade únicamente lo que faltaba a través de la interfaz.

| Colección | Títulos españoles disponibles tras este lote | Resúmenes nuevos en este lote | Pendiente de desarrollar |
| --- | ---: | ---: | --- |
| TA — tácticas | 41 / 41 | 0 (los 41 ya existían) | Revisión y traducciones integrales de descripciones |
| DC — componentes de datos | 120 / 120 | 0 (15 ya tenían resumen) | Redactar o traducir descripciones y ejemplos para 105 restantes |
| DS — fuentes históricas obsoletas | 42 / 42 | 42 | Revisión humana; son fuentes históricas, no reemplazo de DC |
| A — activos ICS | 18 / 18 | 18 | Revisión y ampliación de descripciones |

Los 60 resúmenes nuevos son textos didácticos en español basados en las fichas locales, **no traducciones literales completas** del inglés MITRE. La UI preserva la descripción original en inglés, identifica los borradores pendientes de revisión, permite buscar por nombre español y restaura los nombres ingleses al seleccionar EN. En DS se mantiene siempre la advertencia de categoría obsoleta.

### Itinerario hacia cobertura total

La cobertura de nombres no equivale a la cobertura de todas las explicaciones. Quedan otros lotes de títulos, descripciones y guías para DET (933 estrategias), AN (2.283 analíticas indexadas), software S (974), grupos G (191), campañas C (61), además de los DC restantes sin resumen español y cualquier detalle de T/M/TA aún en inglés. En S, G y nombres propios de campañas deben conservarse nombres y alias documentados; la traducción se centrará en explicaciones técnicas, sin inventar denominaciones ni hechos.

Cada lote debe validar IDs y relaciones contra la instantánea local MITRE v20, comprobar búsqueda y alternancia ES/EN, mantener derechos y atribución, y entrar mediante un PR revisable, **sin fusión automática**.

## Borradores explicativos de los 120 componentes DC y presentación por idioma

El catálogo v20 ya disponía de **15 resúmenes españoles de DC** dentro de los JSON originales. Se han redactado **105 resúmenes educativos específicos adicionales** en el archivo independiente `src/features/learning/mitre-dc-descriptions-es-v20.js`: **120/120 DC con título y resumen español**. Cada texto es una condensación explicativa basada en la descripción inglesa de su componente, no una traducción completa ni una regla de detección validada. Los 105 están pendientes de revisión humana. Las definiciones oficiales, metadatos y relaciones permanecen intactos en los archivos MITRE originales.

En la interfaz ES, una ficha con resumen español presenta **primero el resumen** y deja la descripción inglesa en la sección desplegable «Consultar descripción original MITRE (inglés)»; su lectura sigue siendo posible en cualquier momento. Al cambiar a EN, la descripción inglesa original vuelve a mostrarse directamente y no se muestra el resumen educativo español. Si una ficha todavía **carece de resumen español**, el original inglés sigue visible: no se oculta información sin reemplazo localizado.

La búsqueda encuentra ahora palabras contenidas en los resúmenes educativos DC, A y DS además de los identificadores y títulos. La línea de estadísticas separa la disponibilidad de **títulos DC 120/120** de la de **resúmenes DC 120/120**, para evitar confundir un nombre traducido con una explicación completa. Las pruebas Playwright cubren los 105 IDs añadidos, los 15 existentes, la ausencia de solapamientos, la apertura del original, la búsqueda en español, el cambio de idioma y las fichas sin traducción. **La traducción literal completa de las descripciones MITRE sigue pendiente** y no se reclama como finalizada.


## Subtécnicas T con explicaciones españolas — lote 1 (74 fichas)

Tras los lotes #25–#28, las familias de títulos DC, DS y A ya estaban localizadas y los 120 componentes DC tenían resúmenes educativos, pero seguían muchas descripciones inglesas. Este lote añade **74 explicaciones educativas originales en español de subtécnicas T Enterprise**, cada una con nombre específico, resumen técnico y **orientación de comprobación defensiva**. Los textos corresponden a estrategias de acceso a credenciales (LSASS, SAM, NTDS, DCSync), intérpretes PowerShell y shells, cuentas válidas, modificación de cuentas, servicios remotos, tareas, Kerberos, phishing, credenciales desprotegidas y suplantación de red.

- Nuevos borradores en `src/features/learning/mitre-subtechniques-es-v20.js`, sin modificar ningún archivo en `data/mitre/v20/` ni sustituir descripciones MITRE originales.
- Todos los 74 códigos fueron contrastados con la instantánea v20 local y tienen contenido diferente, específico para la técnica y acciones de verificación defensiva; el estado es **`draft_needs_review`**.
- La vista ES muestra el resumen de la técnica y la comprobación sugerida; conserva el texto inglés oficial en un desplegable. Al cambiar a EN se recuperan nombres, descripción y tácticas originales, sin el contenido añadido en español.
- Las tácticas T asociadas ya se muestran con sus nombres españoles de las 41 tácticas TA indexadas, respetando dominio y sin alterar la relación de origen.
- La búsqueda en español contempla los nombres y las explicaciones nuevas. Se muestra `T 74/935` para las explicaciones **de este lote**, que no representa la cantidad total de títulos T traducidos previamente ni una traducción integral.

**Alcance medido:** 74/935 entradas T tienen una nueva explicación especializada en este módulo (7,91 % de las técnicas/subtécnicas indexadas). El resto conserva el original inglés, aunque algunos registros ya disponían de títulos y notas didácticas más breves procedentes de lotes anteriores. Las descripciones inglesas MITRE son más extensas: estas 74 fichas son **resúmenes educativos**, no traducciones literales completas ni detecciones listas para desplegar. Siguen pendientes otras T y múltiples familias DET/AN/S/G/C/M.

Las pruebas Playwright en escritorio y móvil verifican cobertura y unicidad de los 74 IDs, independencia del inglés de MITRE, búsquedas en español, guía defensiva, nombres localizados de tácticas, modo EN y vuelta a ES.
