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
| **Entradas de búsqueda** | **5.707** (2.268 AN vinculadas a DET + 15 adicionales) |

Los datos proceden de archivos **aportados por el usuario**, capturas HTML del sitio MITRE ATT&CK de octubre de 2026, junto con extracciones estructuradas previas del mismo material. Los JSON **no son un feed en vivo**: conservan nombres/descripciones oficiales en inglés y relaciones explícitas; no se ha inferido qué software empleó una técnica si la página no lo documentaba.

## Disposición

- `manifest.json`: colección, versión, conteos y archivos disponibles
- `index-00.json` a `index-06.json`: búsqueda rápida de IDs con referencia al archivo que contiene su ficha
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

## Subtécnicas T con explicaciones españolas — lote 2 (78 fichas nuevas)

El segundo lote amplía el módulo `src/features/learning/mitre-subtechniques-es-v20.js` **de 74 a 152 fichas educativas completas dentro del módulo**, sobre un total de 935 entradas T en la instantánea v20 (152/935 = 16,26 %). El incremento real es **78 subtécnicas** que antes no tenían guía individual en este módulo.

Se añaden resúmenes específicos y comprobaciones defensivas de estas familias: `T1036` (12 subtipos de suplantación), `T1070` (8 subtipos de eliminación de indicadores), `T1136` (3 creaciones de cuentas), `T1218` (14 usos de binarios/aplicaciones confiables), `T1484` (2 cambios de políticas de dominio), `T1543` (5 servicios/daemons), `T1546` (18 mecanismos de persistencia por eventos), `T1069` (3 enumeraciones de grupos), `T1087` (4 enumeraciones de cuentas), `T1497` (3 mecanismos de evasión de entornos virtuales) y `T1553` (6 formas de alterar controles de confianza).

**Enfoque y límites:** Los títulos, resúmenes y sugerencias de investigación son borradores originales de ATT&CK LAB para ASIR que condensan la descripción inglesa del registro concreto, **no traducciones literales completas u oficiales**. Las acciones de verificación son propuestas de contexto defensivo, no pruebas concluyentes ni reglas SIEM listas para producción. Los 935 registros T MITRE originales permanecen intactos y se pueden consultar en inglés desde la misma ficha; al seleccionar EN, las explicaciones educativas ES no aparecen. Todas las 152 fichas del módulo están marcadas `draft_needs_review` y requieren revisión humana.

**Verificación:** Se ha contrastado que los 78 IDs nuevos existen en los JSON v20, que no se repiten entre sí ni con los 74 del lote anterior y que no reemplazan notas españolas anteriores. Se actualizan las pruebas de regresión a 152/935 y se añaden cinco escenarios Playwright de búsqueda española, suplantación, ejecución mediante utilidades conocidas, persistencia WMI, identidades, controles de confianza y alternancia ES/EN en escritorio y móvil.

**Siguiente cobertura pendiente:** las 783 entradas T sin ficha específica de este módulo, además de DET, AN, software S, grupos G, campañas C y mitigaciones M que aún muestran detalles ingleses. La cifra 152/935 cuantifica las nuevas explicaciones de este módulo; **no es una medición de nombres españoles existentes en otras capas**.


## Subtécnicas T con explicaciones españolas — lote 3 (72 fichas nuevas)

Con el tercer lote, `src/features/learning/mitre-subtechniques-es-v20.js` pasa de **152 a 224 subtécnicas T con resumen específico y comprobación defensiva en español**. Se incorporan **72 fichas nuevas** del catálogo v20; representan un **23,96 % de las 935 entradas T** si se usa como referencia el conjunto de técnicas y subtécnicas, aunque la numeración de este módulo solo incluye subtécnicas, no las técnicas raíz. No confundir esta cifra con el total de títulos T localizados por otros glosarios.

| Familia | Nuevas fichas | Área de investigación defensiva |
| --- | ---: | --- |
| T1027 — Ofuscación de archivos e información | 18 | Codificación, empaquetado, archivos HTML/SVG, Unicode y almacenamiento |
| T1055 — Inyección de procesos | 12 | Memoria de procesos, hilos, DLL, ptrace y vaciado de procesos |
| T1548 — Mecanismos de elevación | 6 | UAC, sudo, setuid, TCC y roles temporales cloud |
| T1574 — Secuestro del flujo de ejecución | 12 | Bibliotecas, búsqueda de rutas, permisos y carga de .NET |
| T1564 — Ocultación de artefactos | 14 | Archivos, cuentas, correo, atributos, montajes y ventanas |
| T1204 — Ejecución por el usuario | 5 | Enlaces, archivos, imágenes, copia y pegado, bibliotecas |
| T1071 — Protocolos de aplicación | 5 | Tráfico web, transferencia de archivos, correo, DNS y pub/sub |
| **Total del lote** | **72** | |

Cada ficha incorpora (a) un **título específico en español**, (b) un resumen educativo redactado para ASIR y (c) una indicación sobre **qué comprobar y qué no demuestra por sí sola una señal**. Todos los códigos se han contrastado contra `data/mitre/v20/techniques-*.json`, sin identificadores inexistentes, duplicados ni sustitución de descripciones originales. Las fichas quedan etiquetadas como `draft_needs_review`.

Se conserva el texto MITRE EN completo y desplegable en el modo ES, y se muestra normalmente cuando se cambia a EN. La búsqueda indexa las nuevas explicaciones y recomendaciones en español. Se han ampliado las pruebas Playwright de regresión a **224/935**, con nuevos casos para T1027.006, T1055.012, T1574.009, T1564.008, T1204.004, T1548.003 y T1071.004; se prueban navegación, búsqueda y alternancia de idioma en escritorio y móvil.

**Alcance y limitaciones:** Estos son resúmenes docentes específicos, **no traducciones literales completas ni oficiales de MITRE**, y requieren revisión humana antes de su publicación como contenido consolidado. Quedan **711 registros T sin ficha en este módulo** y descripciones en inglés pendientes en T, DET, AN, software S, grupos G, campañas C y mitigaciones M. Los originales MITRE, relaciones y citas no se modifican.


## Estrategias DET y analíticas AN en español — segundo lote (32 DET + 57 AN)

Esta entrega continúa la localización de **detecciones y telemetría**, complementando los tres lotes recientes de subtécnicas T. Amplía `src/features/learning/mitre-det-an-es-v20.js` con **32 estrategias DET** y **57 analíticas AN** adicionales, pasando de **19 a 51 estrategias DET** y de **83 a 140 analíticas AN** con borradores educativos propios en español. Los denominadores del archivo v20 son 933 DET y 2283 AN indexadas (incluidas las entradas AN adicionales del índice).

Las estrategias nuevas proceden de registros reales de `detections-00.json` y abarcan metadatos IaaS, pub/sub, PATH, utilidades renombradas, relaciones de confianza de dominio, cadena de suministro, disparadores de ejecución, ofuscación de red, VBA Stomping, datos de navegador, preparación de archivos, inventario de defensas, shims, bibliotecas compartidas, símbolos eliminados, perfiles de shell, autenticación forzada, empaquetado, cachés Kerberos, Electron, procesadores de impresión, comunicaciones web, acceso condicional, firmas digitales, archivos ocultos, accesibilidad, servicios web bidireccionales, alta de dispositivos, credenciales de navegador, permisos de instaladores, resolución dinámica y retirada de persistencia.

Cada **DET** tiene un título y resumen educativo propio, una señal que merece investigación, fuentes de telemetría o comprobación posibles, una advertencia sobre limitaciones y falsos positivos, y una pregunta para alumnado ASIR. Cada **AN** añade un título, resumen y orientación de comprobación adaptados al registro fuente y su plataforma. La interfaz española utiliza esos textos para la búsqueda y fichas relacionadas; el inglés MITRE permanece consultable, se recupera al cambiar a EN y **no se modifica** la instantánea `data/mitre/v20/`, sus códigos, parámetros, orígenes ni relaciones.

**Estado:** todos los nuevos textos son borradores originales `draft_needs_review`, **no traducciones literales completas ni oficiales**, ni reglas SIEM listas para producción. Se recomienda revisión humana y contraste con la telemetría real antes de incorporar un ejemplo a laboratorios evaluables. El avance no implica que todas las 933 DET o 2283 AN estén traducidas.

**Verificación del lote:** los 32 códigos DET y 57 códigos AN se han cotejado con las asociaciones de `detections-00.json`; no existen IDs nuevos inventados, duplicados ni sustitución de los 19/83 registros previos. Se actualizan las regresiones y se añaden pruebas Playwright de cobertura, búsqueda española, navegación DET→AN, lectura de las fuentes inglesas, parámetros de ajuste, alternancia ES/EN y tratamiento transparente de fichas aún pendientes, tanto en escritorio como en móvil.


## Procedimiento común para traducciones **íntegras** de todas las categorías

Se documenta el procedimiento y los criterios de salida en [MITRE_TRANSLATION_STANDARD.md](MITRE_TRANSLATION_STANDARD.md). Todas las colecciones T, TA, DET, AN, DC, DS, A, S, G, C y M seguirán ese mismo contrato de traducción del campo fuente completo, preservación del inglés, metadatos, comprobación de IDs, búsquedas ES/EN, revisión humana y pruebas Playwright. Una nota didáctica o título traducido **no representa una traducción completa**.

Este primer lote de traducciones íntegras cubre **42/42 descripciones de fuentes DS históricas (obsoletas)** y **18/18 descripciones de activos industriales A**, con sus textos completos en `src/features/learning/mitre-full-descriptions-es-v20.js`. Todos están en borrador pendiente de revisión. La biblioteca muestra **«Descripción íntegra ... (borrador)»** en lugar de «Resumen educativo», mantiene el inglés original desplegable, permite consultar el original al seleccionar EN y busca dentro de las nuevas traducciones. El estado y la cobertura de las demás categorías no se inflan por este avance.

Los lotes siguientes deben traducir además todos los **campos narrativos anidados** visibles de cada colección cuando corresponda (especialmente las descripciones de elementos de configuración AN), no solo `description_en`.


## Tácticas TA — traducción íntegra de las descripciones disponibles (39/41)

Se incorporan al contrato común **39 descripciones españolas íntegras** de tácticas Enterprise, Mobile e ICS, junto a las 60 traducciones anteriores de DS y A: **99 traducciones íntegras en total**. De las 39 TA se han **reutilizado las 12 traducciones ya redactadas** en la rama `feature/mitre-v20-ta-full-es-batch1` y añadido **27 nuevas**, sin sustituir resúmenes educativos ni modificar los JSON MITRE. Se utiliza un módulo separado `src/features/learning/mitre-tactics-descriptions-es-v20.js` enlazado por `AttackFullSpanishV20`, con estados `scope: full_description` y `draft_needs_review`.

**Excepción de la fuente:** El manifiesto enumera **41** tácticas, pero **TA0038 (Mobile: Network Effects)** y **TA0039 (Mobile: Remote Service Effects)** carecen de `description_en` **y de `short_en`** en `tactics-00.json`. No se han inventado textos ingleses ni se han promovido sus resúmenes `summary_es` a traducciones íntegras. Se mantiene el indicador **TA 39/41**, con **39/39 descripciones inglesas disponibles traducidas** y dos entradas pendientes por carencia de descripción fuente. Las otras 39 fichas tienen `short_en`, que repite la primera frase de `description_en`; ese campo fuente no se modifica y sigue consultable en el JSON. Los resúmenes `summary_es` antiguos se conservan como capa educativa, sin considerarlos traducciones completas.

**Precaución de fidelidad:** la descripción inglesa de TA0105 (ICS Impact) menciona dos veces `Impair Process Control` al describir métodos de impacto y obstaculización de salvaguardas. El borrador conserva esa repetición de la instantánea local; no se ha atribuido al original una mención distinta que no contiene. Requiere cotejo humano bilingüe, como las restantes traducciones. No se han alterado nombres de herramientas, dominios, identificadores ni enlaces.

**Integración y comprobación:** los textos TA aparecen como traducciones íntegras en borrador cuando se consulta la ficha en español, con el original inglés accesible en el desplegable. En inglés se mantiene exclusivamente la fuente. La búsqueda indexa el contenido español y la estadística separa descripciones íntegras de guías educativas. La suite Playwright comprueba cobertura y unicidad de 39 IDs, dos descripciones ausentes, preservación de fuentes, traducciones ICS y Mobile largas, búsquedas, fallback sin atribución falsa, cambio ES→EN→ES y regresión de DS/A. Los resultados efectivos de GitHub Actions deben consultarse en el PR, sin atribuir revisión humana a una batería de tests.

## Mitigaciones M — traducciones íntegras ICS y Mobile (66/109)

Se han traducido íntegramente los campos `description_en` de las **53 mitigaciones ICS** y las **13 mitigaciones Mobile** presentes en `data/mitre/v20/mitigations-00.json`. Ninguna de estas 66 fichas carece de descripción en el origen. En ese primer lote, las **43 mitigaciones Enterprise** todavía esperaban traducción íntegra: sus posibles títulos o resúmenes en español siguen siendo educativos y no cuentan como traducciones completas.

Los 66 borradores separados de MITRE residen en `src/features/learning/mitre-mitigations-descriptions-es-v20.js`, con `scope: 'full_description'` y `status: 'draft_needs_review'`. Se incluyen mediante `window.AttackMitigationFullSpanishV20` en el contrato unificado `window.AttackFullSpanishV20`. La búsqueda encuentra palabras de las descripciones completas en español; el modo EN presenta la descripción original íntegra, y en ES se puede desplegar igualmente el inglés. Se preservan los identificadores, la vinculación de mitigaciones con técnicas y los enlaces MITRE.

Se han contrastado los **66 IDs únicos**, la disponibilidad del texto inglés y la correspondencia exacta de las marcas de referencia `[1]`/`[2]` entre la fuente y los borradores. Para textos largos como M1013 (Mobile, orientación para desarrolladores) se conservan todos los casos de uso y herramientas mencionados en el original. El inglés de M1009 habla de una obligación futura de Apple y se ha traducido sin actualizar retrospectivamente la fuente. En M0805 se explicita la anomalía `release values` presente en inglés.

En el lote inicial de mitigaciones, la cobertura global del contrato pasó de **99 a 165 descripciones íntegras en español**: **DS 42/42 · A 18/18 · TA 39/41 · M 66/109**. Estas cantidades no acreditan una traducción completa de las 5.707 entradas ni una revisión bilingüe; las 165 traducciones siguen en estado de borrador. Véase `docs/MITRE_TRANSLATION_STANDARD.md` para el procedimiento y las limitaciones.

## Mitigaciones Enterprise — primer lote de traducciones íntegras (12/43)

Se incorporan traducciones completas de `description_en` para **12** mitigaciones Enterprise: `M1017`, `M1020`, `M1021`, `M1029`, `M1031`, `M1037`, `M1039`, `M1041`, `M1042`, `M1053`, `M1056` y `M1060`. Estas se añaden al mismo overlay de mitigaciones existente, conservando las 66 traducciones ICS/Mobile. Se mantienen los identificadores, los originales MITRE v20, los enlaces, los ejemplos específicos, las condiciones de uso y las relaciones documentadas con técnicas.

El contador pasa a **M 78/109**: ICS 53/53, Mobile 13/13 y Enterprise 12/43, con **31 Enterprise pendientes**. En todas las categorías del contrato hay ahora **177 descripciones íntegras**: DS 42 + A 18 + TA 39 + M 78. Son borradores `draft_needs_review` y no traducciones revisadas ni oficiales.

Este lote incorpora mitigaciones sobre inspección SSL/TLS, filtrado web y de red, almacenamiento remoto, cifrado, permisos de variables de entorno, medidas previas al compromiso, copias de seguridad, eliminación de software innecesario, formación de usuarios y comunicaciones fuera de banda. Los casos de uso, nombres de productos, siglas y referencias se mantienen en sus fichas. La auditoría verifica los 12 IDs, sus referencias numeradas, la disponibilidad íntegra de originales y la integración ES/EN. No se presentan como normas técnicas validadas los comandos de ejemplo del snapshot: en particular, el texto original de **M1029** contiene un ejemplo incompleto de reenvío de Suricata, que no se ha completado inventando un valor.

Las traducciones de las otras 31 mitigaciones Enterprise requieren nuevos lotes. Los textos traducidos se indexan en el buscador del catálogo, y las pruebas de Playwright verifican el cambio ES→EN→ES y que fichas pendientes, como M1015, no se atribuyan una traducción íntegra.

## Mitigaciones Enterprise — segundo lote de traducciones íntegras (24/43)

Se añaden **12 descripciones completas `description_en`** de mitigaciones Enterprise a las doce del lote anterior. Nuevos IDs: `M1015`, `M1016`, `M1018`, `M1019`, `M1022`, `M1024`, `M1025`, `M1026`, `M1027`, `M1028`, `M1030` y `M1032`. Incluyen configuraciones de Active Directory, análisis de vulnerabilidades, gestión de cuentas, inteligencia de amenazas, permisos del sistema de archivos y del Registro, procesos y cuentas privilegiados, contraseñas, configuración de sistemas operativos, segmentación y autenticación multifactor.

Con este PR, el estado **actual** del contrato común es **M 90/109** (ICS 53/53, Mobile 13/13 y Enterprise 24/43), con **19 Enterprise pendientes**, y **189 descripciones íntegras ES** en total: 42 DS + 18 A + 39 TA + 90 M. Son `draft_needs_review`; no equivalen a traducciones oficialmente revisadas por MITRE ni cubren todas las entradas del catálogo.

Se traducen los ejemplos, condiciones, nombres técnicos y herramientas de las doce descripciones **sin alterar** `data/mitre/v20/mitigations-00.json`. El visor muestra el texto español y permite consultar el inglés íntegro; la búsqueda incluye el contenido español y las relaciones documentadas no cambian. Nuevas pruebas Playwright verifican esos IDs, el estado de borrador, el cambio ES→EN→ES, los ejemplos de Active Directory, la búsqueda, las rutas de Windows/Linux, los comandos textuales y la regresión de registros aún pendientes, como M1033.

**Precaución con las recomendaciones históricas:** los comandos de ejemplo se conservan del documento original, pero no se han probado como instrucciones seguras para un entorno real. Especialmente, el texto fuente M1027 dice utilizar `pwunconv` para evitar la reutilización de contraseñas, y M1018 recomienda cambios cada 90 días; ambos enunciados están reproducidos como contenido de MITRE v20 y **requieren revisión técnica**, no deben interpretarse automáticamente como práctica vigente.

## Mitigaciones Enterprise — lote final: descripciones M completas (109/109)

Se incorporan traducciones íntegras de `description_en` para las **19 mitigaciones Enterprise restantes**: `M1033`, `M1034`, `M1035`, `M1036`, `M1038`, `M1040`, `M1043`, `M1044`, `M1045`, `M1046`, `M1047`, `M1048`, `M1049`, `M1050`, `M1051`, `M1052`, `M1054`, `M1055` y `M1057`. Los textos completos incluyen descripción, casos de uso, medidas concretas, herramientas, condiciones y ejemplos de su instantánea MITRE v20.

**Cobertura actual de las descripciones M: ICS 53/53, Mobile 13/13, Enterprise 43/43; total 109/109 (100 %).** Quedan así **208 descripciones completas traducidas en el contrato común**, sumando DS 42 + A 18 + TA 39 + M 109. **Este avance no supone la traducción completa del catálogo de 5.707 entradas**: otras familias (T, S, DET, AN, DC, G y C) y campos anidados tienen trabajo pendiente. Las dos tácticas TA0038/TA0039 no tenían descripción inglesa traducible en la fuente archivada.

Se conserva el JSON inglés de `data/mitre/v20/mitigations-00.json` sin cambios, incluidos los IDs y relaciones. El overlay español sigue bajo `src/features/learning/mitre-mitigations-descriptions-es-v20.js`; las entradas son `scope: 'full_description'` y `status: 'draft_needs_review'`, **no revisadas**. El idioma EN muestra los textos originales, el idioma ES presenta las traducciones y un desplegable para el original, y la búsqueda encuentra fragmentos de la traducción.

La auditoría coteja los **109 IDs únicos**, la existencia de la descripción fuente de cada uno y la conservación de todas las referencias numeradas `[n]`. Las pruebas Playwright contemplan ES→EN→ES, ejemplos técnicos, vínculos, búsqueda de contenido español, el caso especial **M1055 / Do Not Mitigate** y regresión de las traducciones anteriores. Las instrucciones técnicas presentes en las descripciones **no deben ejecutarse ni darse por prácticas actualizadas sin revisión específica**; la traducción fiel preserva afirmaciones y ejemplos del documento original, incluso cuando requieren comprobación independiente.
