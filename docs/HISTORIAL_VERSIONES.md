# ATT&CK LAB v25 — Contextual Network Casebook

Esta versión amplía la v24 y conserva los módulos anteriores.

## Cambios
- Nueva sección «Casos de red»: 3 investigaciones detalladas sobre DNS repetitivo, conexiones periódicas TLS y transferencia saliente de gran volumen.
- Cada caso incluye situación organizativa, personas implicadas, objetivos, información faltante, cinco eventos sintéticos comentados, cuatro preguntas contextualizadas con retroalimentación específica, hipótesis alternativa y fuentes oficiales.
- El alumno selecciona evidencias, explica conclusiones y exporta informe JSON. Los textos son bilingües.
- Se distingue de forma explícita entre comportamiento anómalo, hipótesis MITRE y confirmación de ataque.
- No se ejecuta tráfico real ni se analizan víctimas auténticas. La PCAP de la v24 se conserva.

## Uso
Abre `index.html` y entra en «Casos de red / Network casebook». No requiere instalación ni servidor. El progreso de respuestas y notas se almacena localmente en el navegador. Los enlaces externos requieren Internet.

## Alcance de las evaluaciones
Las respuestas de opción múltiple se puntúan automáticamente. Los informes narrativos requieren revisión humana. Los ejercicios aportan aprendizaje, no son pruebas forenses de incidentes históricos.

---

# ATT&CK LAB v24 — Network Forensics

## Nuevo en v24

- Seis microlecciones bilingües: capas, TCP, DNS, HTTP, TLS y límites de las capturas.
- Explicación por campos, analogías, advertencias sobre sobreinterpretación y filtros de visualización Wireshark.
- Visor educativo de siete eventos con filtros y búsqueda.
- Cuatro preguntas con feedback y guardado local, cuaderno y exportación JSON.
- `network-training-v24.pcap`: siete paquetes Ethernet/IPv4 de DNS, TCP y HTTP generados para la academia. Se puede abrir con Wireshark sin conexión; no incluye malware ni datos reales.
- Enlaces oficiales de lectura complementaria.

### Cómo empezar
Abrir `index.html`, elegir «Tráfico de red / Network forensics» en el menú y descargar la PCAP si se desea practicar con Wireshark. No se requiere servidor para el contenido local. La opción de cargar el catálogo completo MITRE sí requiere Internet.

### Aviso
Las pistas, paquetes y ejemplos son sintéticos; no corresponden a incidentes forenses reales. La lección de TLS muestra texto didáctico, NO tráfico TLS real dentro de la PCAP.

# ATT&CK LAB v22 — Laboratorio introductorio de análisis de malware

Nueva sección: «Malware: análisis seguro». Lecciones bilingües sobre análisis estático, hashes, metadatos, IOC y su contexto, lectura de reglas YARA, trazabilidad y un estudio de caso totalmente ficticio. Incluye mini cuestionarios, guía de interpretación, cinco evidencias mezcladas, corrección explicada, cuaderno y exportación JSON.

**Seguridad:** jamás se ejecutan archivos sospechosos. Los fragmentos de YARA son material educativo de lectura y evaluación simplificada; **no** se ejecuta el motor YARA ni se analizan binarios. Los indicadores e IP son inventados o reservados para documentación. No subir archivos confidenciales a servicios públicos sin permiso.

Abra `index.html` en el navegador. El catálogo MITRE completo requiere conexión a Internet; los módulos educativos funcionan offline.

**Fuentes de aprendizaje:** YARA (https://yara.readthedocs.io/), MITRE ATT&CK (https://attack.mitre.org/), NIST SP 800-86 (https://csrc.nist.gov/pubs/sp/800/86/final), CISA Malware Analysis (https://www.cisa.gov/resources-tools/services/malware-next-gen-analysis). Son enlaces externos, no recursos incorporados.

**Limitaciones:** muestras ficticias, no se atribuye familia o actor, no hay análisis dinámico, no hay motor YARA genuino, no hay muestra de malware real.

---

# ATT&CK LAB — Web educativa

Proyecto independiente de MITRE: explorador bilingüe (español / inglés) orientado al aprendizaje de hacking ético y defensa.

## Cómo abrirlo

1. Extrae **todos los archivos** del ZIP conservando su carpeta.
2. Abre `index.html` en tu navegador. El modo demostración funciona sin servidor ni conexión.
3. Para consultar el catálogo Enterprise completo, conéctate a Internet y pulsa **«Cargar catálogo oficial»**. Descarga el JSON STIX del repositorio público de MITRE (aprox. 50 MB; puede tardar).
4. Si el navegador bloquea las peticiones al abrir archivos locales, abre una terminal en esta carpeta, ejecuta `python -m http.server 8000` y entra en `http://localhost:8000`.

## Qué incluye

- 14 tácticas navegables; catálogo completo de técnicas/subtécnicas **cuando se carga** el STIX oficial; relaciones padre-hijo.
- Buscar por nombre, código ATT&CK y descripción; filtros y desplegables.
- Fichas con comportamiento, mitigaciones, señales de detección, grupos/campañas directamente relacionados, recursos oficiales y una pregunta de reflexión.
- Español/inglés en la interfaz y traducción curada de una muestra educativa (no se afirma que todos los textos de MITRE estén traducidos).
- Favoritos persistidos en el propio navegador y cuatro itinerarios educativos.
- Modo de demostración sin conexión (selección ilustrativa, **no** un catálogo completo).

## Limitaciones y criterio de atribución

- Los textos y relaciones del catálogo oficial se sirven en **inglés**, salvo en la muestra traducida; no hay traducción automática de MITRE ni garantía de traducción integral.
- Los elementos de tipo `campaign` y `intrusion-set` se muestran cuando MITRE documenta relaciones directas `uses` con la técnica: una relación con un grupo **no equivale a un incidente individual**.
- Las mitigaciones aparecen cuando existe una relación STIX directa `mitigates`; las detecciones se extraen de `detects` cuando están disponibles en la versión descargada. En ausencia de relación se muestran pautas generales rotuladas por el contexto, no controles oficialmente asignados.
- Datos de demostración y explicaciones en español son simplificaciones educativas. Los ejemplos son deliberadamente de alto nivel y no incluyen instrucciones de intrusión.
- La actualización requiere conexión y no guarda el fichero de 50 MB en el paquete.

## Fuentes

- https://attack.mitre.org/
- https://github.com/mitre-attack/attack-stix-data
- https://mitre-attack.github.io/attack-data-model/schemas/relationship-types/
- https://attack.mitre.org/resources/legal-and-branding/

MITRE ATT&CK® es una marca de The MITRE Corporation. Proyecto independiente, no afiliado a MITRE.

## Ampliación: práctica y repaso (v2)

- Nueva sección **Práctica y repaso** con preguntas de opción múltiple sobre tácticas y técnicas activas del catálogo cargado.
- En cada ficha: **marcar como estudiada** y **apuntes personales** (hasta 4.000 caracteres por ficha).
- Panel con cantidad de fichas estudiadas, apuntes escritos y porcentaje acumulado de respuestas correctas.
- Exportación e importación de los apuntes, marcadores de estudio, estadísticas y favoritos como JSON (los favoritos incluidos en el archivo de exportación se entregan para portabilidad, pero actualmente **no se restauran** durante la importación).
- Recursos adicionales MITRE D3FEND, estrategias de detección ATT&CK, SigmaHQ y CISA. Son bibliotecas generales, **no** vínculos afirmados a técnicas individuales.
- Todos los datos de progreso se almacenan en `localStorage` del navegador: no se envían a un servidor. No se incluye sincronización entre dispositivos.
- Preguntas didácticas generadas localmente; no son un examen de certificación. Una técnica puede corresponder a varias tácticas: se acepta y evalúa la táctica seleccionada por la pregunta, no todas las tácticas aplicables.

**Limitaciones:** El catálogo oficial requiere conexión a Internet; las traducciones completas revisadas y una base de incidentes individuales comprobados siguen pendientes. Las relaciones MITRE con grupos y campañas no deben entenderse automáticamente como incidentes específicos.

## Ampliación v3: lecciones guiadas e incidentes verificables

- Pestaña **Lecciones guiadas**: ocho lecciones seleccionadas (T1566, T1566.001, T1566.002, T1078, T1059.001, T1195.002, T1486, T1003).
- Cada una cuenta con objetivo, comportamiento del adversario explicado a alto nivel, evidencias, mitigaciones, ejercicio defensivo con datos ficticios, pregunta y respuesta orientativa.
- Incidente real trazable para **T1195.002**: SolarWinds Orion (campaña C0024), respaldado por las páginas oficiales de MITRE ATT&CK. No se extrapolan incidentes al resto de las técnicas.
- Pestaña y lecciones integradas con el explorador; enlace desde ficha si existe unidad didáctica.
- Las lecciones completadas se guardan localmente en el navegador bajo `attacklab-lessons` (no se incluyen todavía en el JSON de exportación de la v2).
- La interfaz conserva selección de español/inglés, **pero el texto detallado de las ocho lecciones solo está redactado en español por ahora**; se avisa en la vista inglesa. Los títulos aparecen en ambos idiomas.
- Los enlaces MITRE requieren conexión, pero las lecciones y ejercicios escritos funcionan sin conexión.

Referencias verificadas: https://attack.mitre.org/techniques/T1195/002/ y https://attack.mitre.org/campaigns/C0024/ .

Este módulo contiene redacción educativa original y no representa una traducción oficial de MITRE.

## Ampliación v4: Laboratorios SOC interactivos

- Nueva pestaña **Laboratorios SOC** con cinco investigaciones ficticias: phishing con enlace (T1566.002), PowerShell desde ofimática (T1059.001), uso sospechoso de una cuenta válida (T1078), cifrado de archivos (T1486) y actualización de software comprometida (T1195.002).
- Cada escenario incluye contexto, objetivo de aprendizaje, tabla de cinco o seis eventos sintéticos, selección de evidencias sospechosas, una pista, pregunta de decisión defensiva y corrección explicada. No hay enlaces maliciosos ejecutables ni se necesita ejecutar comandos.
- La puntuación es de 60 puntos por evidencia relevante (penalización por falsos positivos) y 40 por decisión correcta; 80 puntos para superar un laboratorio. Se conserva la mejor puntuación y el número de intentos en el `localStorage` de este navegador.
- La exportación **SOC** descarga exclusivamente el progreso de los laboratorios en un JSON independiente de la exportación de apuntes del módulo Práctica.
- Escenarios, explicaciones y controles están disponibles en español e inglés. Los logs usan direcciones de documentación (`.example`, `.invalid` y `198.51.100.0/24`) y no describen incidentes reales. No sustituye la investigación de eventos reales.
- Puedes abrir `index.html` directamente y usar los laboratorios sin Internet; únicamente los enlaces de consulta requieren conexión.


## v5 · Biblioteca de incidentes reales

Nueva sección «Incidentes reales» con cuatro estudios de caso sustentados en fuentes primarias: SolarWinds Orion (2020), Colonial Pipeline (2021), Microsoft Exchange (2021), MOVEit Transfer (2023). Incluye cronologías, evidencias orientativas de investigación SOC, controles defensivos, vínculos bidireccionales con fichas ATT&CK, filtros, búsqueda, ejercicios y enlaces a CISA/FBI/DOE.

**Rigor:** cada relación ATT&CK aparece como *documentada* si la fuente la nombra directamente, o *mapeo analítico* cuando es una clasificación educativa. Las evidencias que investigaría un SOC son listas pedagógicas y **no se presentan como artefactos forenses encontrados en la víctima**. Las fuentes enlazadas son públicas y pueden actualizarse; la biblioteca no pretende ser una base exhaustiva. El módulo está redactado en español; su estructura de interfaz soporta inglés pero no se han traducido todavía todos los textos editoriales de los casos.

## Novedades v6 — Investigaciones guiadas

Se incorpora **Investigaciones guiadas** en el menú principal. Incluye cuatro casos pedagógicos asociados a SolarWinds (2020), Colonial Pipeline (2021), MOVEit (2023) y Exchange (2021):

- Registros **completamente sintéticos** para seleccionar evidencias.
- Reconstrucción cronológica interactiva con orden único de eventos.
- Decisiones de respuesta defensiva con puntuación automática (40 evidencia + 30 cronología + 30 respuesta).
- Campo de informe libre y exportación JSON con evaluación, hipótesis y limitaciones.
- Puntuaciones guardadas localmente (sin backend ni envío a servicios externos).
- Fuentes históricas enlazadas, diferenciadas expresamente de los registros inventados.

**Importante:** las trazas, horas, nombres de sistemas y acciones de cada ejercicio son ficticios, no artefactos forenses reales. Los vínculos ATT&CK del ejercicio son educativos. La evaluación no analiza automáticamente la calidad del informe libre. Navegación y controles en español/inglés; los textos explicativos de estos cuatro ejercicios están principalmente en español. La biblioteca de incidentes de v5 permanece intacta.


## v7 — Consola SIEM simulada

Nueva sección **Consola SIEM** en el menú lateral. Incluye cuatro escenarios de telemetría totalmente sintética inspirados en SolarWinds, Colonial Pipeline, MOVEit y Exchange. Los sucesos mostrados son inventados y **no constituyen evidencias de los incidentes reales**.

- Buscar eventos por texto, ID, host, acción o detalle.
- Filtrar por severidad mínima, fuente, equipo; ordenar por fecha/hora.
- Seleccionar evidencias incluso a través de filtros; construir una línea temporal correlacionada.
- Registrar hipótesis, incertidumbres y medidas propuestas.
- Corrección automática orientativa de selección de eventos (no califica redacción).
- Exportar CSV de eventos filtrados, JSON del escenario e informe JSON del analista.
- Guardar el trabajo por escenario en localStorage, sin servidor.

### Límites

No es un SIEM real ni ingiere registros externos. Los eventos son didácticos, no artefactos forenses auténticos. La interfaz está traducida, pero partes del contenido editorial de los escenarios permanecen en español. No enviar informes a terceros con datos confidenciales.

## v8: centro de detección (Sigma educativo)

La nueva pestaña **Ingeniería de detección** añade un constructor de reglas con filtros sobre campos de eventos, operadores contains/equals/starts y combinación AND/OR. Cuenta con un simulador local sobre los eventos sintéticos del SIEM v7; presenta matriz de confusión (TP, FP, FN, TN), precisión, cobertura y coincidencias, y permite exportar YAML en un subconjunto simple de Sigma y un informe JSON. Incluye enlaces a la especificación SigmaHQ y MITRE ATT&CK. Los criterios de verdad se basan en las etiquetas docentes del simulador anterior.

**Limitación importante:** el YAML generado es un ejemplo experimental con `logsource: product: attacklab / category: synthetic_events`. No está validado contra una plataforma SIEM real. Para usar reglas con datos operativos, adaptar logsource y campos, validar con herramientas Sigma compatibles y probar con telemetría autorizada. La aplicación no interpreta reglas YAML arbitrarias, ni ejecuta código, ni consulta redes externas durante las simulaciones.


## V9 — Threat Hunting, bienvenida y ayuda
- `hunting.js`: búsquedas por texto, fuente y severidad en los registros simulados existentes; hipótesis, selección de evidencias, cronología, métricas didácticas y exportación JSON.
- `onboarding.js`: modal de bienvenida de tres pasos (solo primera visita, reabrible desde Ayuda), centro de ayuda bilingüe, navegación guiada y FAQ.
- Los logs siguen siendo sintéticos; las métricas no equivalen a una validación real. Las hipótesis y el informe se guardan en localStorage.
- Al actualizar desde versiones anteriores conviene exportar antes el progreso si se cambia de navegador.


## Ampliación v10: itinerarios accesibles y aprendizaje didáctico

- Nueva pestaña **Itinerarios formativos**, con 4 niveles y **12 unidades** completamente redactadas en español e inglés: Fundamentos, SOC Junior, Threat Hunting y Detection Engineering.
- Cada unidad sigue un método repetible: qué aprenderás → explicación clara → analogía cotidiana → ejemplo → qué registros revisaría un analista → protección → pregunta con explicación de la respuesta.
- **Glosario bilingüe de 19 términos** (SIEM, SOC, táctica, técnica, subtécnica, falso positivo, etc.) en lenguaje sencillo.
- Seguimiento por unidad al responder correctamente. Se almacena únicamente en `localStorage` bajo `attacklab-courses-v10`; no forma parte de las exportaciones de otros módulos.
- El Centro de Ayuda y la bienvenida redirigen a este nuevo punto de entrada para principiantes.
- Contenidos y actividades son originales y didácticos: los ejemplos no son evidencias forenses de incidentes ni transcripciones oficiales de MITRE.
- **Pendiente:** revisar pedagógicamente todas las fichas del catálogo oficial y unificar todas las exportaciones de progreso de los distintos módulos.

## v11 — Fichas didácticas progresivas

El módulo `didactics.js` incorpora una explicación fácil, una analogía cotidiana, un flujo conceptual, orientación defensiva y una pregunta de autoevaluación en las fichas de técnicas y subtécnicas. El contenido se adapta al idioma español o inglés seleccionado.

Hay diez familias temáticas revisadas con contenidos concretos (`T1566`, `T1078`, `T1059`, `T1190`, `T1195`, `T1486`, `T1110`, `T1021`, `T1003`, `T1041`). Las subtécnicas de estas familias reciben **solo una orientación general de su técnica principal**, siempre rotulada como tal; para el resto se ofrece una introducción genérica por táctica, también marcada como no específica. Esto no equivale a disponer de una traducción o un análisis individual completos de todas las técnicas.

Los bloques usan ejemplos conceptuales creados para formación. No son registros históricos ni indican que MITRE respalde la adaptación didáctica. El catálogo oficial cargado conserva sus referencias originales.

No requiere instalación adicional ni conexión a Internet para las fichas del modo demostración. Para cargar el catálogo completo de MITRE se necesita Internet.

## v12 — Microlecciones específicas de subtécnicas

El módulo `subtechniques.js` incorpora 12 microlecciones bilingües, integradas en el panel de detalle del catálogo oficial. Incluye T1566.001, T1566.002, T1566.003, T1059.001, T1059.003, T1059.006, T1547.001, T1053.005, T1543.003, T1505.003, T1195.002 y T1078.004. Se muestran al abrir la subtécnica correspondiente, siempre que esté presente en el catálogo cargado. Incluyen explicación, analogía, esquema, dos eventos sintéticos comentados, defensa y pregunta autocorregida. En las doce subtécnicas sustituyen la orientación general anterior, sin duplicarla. El catálogo demostrativo no tiene por qué incluir las doce; para visualizarlas todas, utiliza la carga del catálogo oficial.

Los ejemplos no son telemetría forense real. El contenido es editorial y no supone un mapeo oficial de mitigaciones. Se incluyen enlaces a las páginas MITRE para contrastar cada identificador. No se ha realizado una prueba visual de navegador completa.

## v13 · Cadenas de ataque / Attack chains

Nueva sección de navegación **Cadenas de ataque**: tres secuencias **ficticias** (correo y credenciales, aplicación web y persistencia, acceso remoto y cifrado) con 11 fases en total. Cada fase muestra un vínculo MITRE ATT&CK, una explicación didáctica, un registro **sintético** comentado, un control defensivo desplegable y una pregunta formativa con explicación. El usuario puede recorrer libremente las fases y marcar pasos como aprendidos; el progreso se guarda en `localStorage` bajo `attacklab-chains-v13`.

**Limitación importante:** no es una atribución de incidentes históricos ni afirma que toda intrusión transcurra siguiendo el mismo orden. Las transiciones son relaciones conceptuales para aprender y no se incluyen instrucciones operativas de intrusión.

Archivos añadidos: `attackchains.js`. CSS e `index.html` actualizados. Funciona sin acceso a red excepto por los enlaces externos MITRE.

## Nuevo en v14: tablero de investigación visual

- Tres investigaciones ficticias (correo sospechoso, servidor web, cambios masivos de archivos).
- El alumno selecciona evidencias pertinentes, ordena eventos y les asigna técnicas ATT&CK.
- Corrección razonada que muestra por qué un registro es significativo y qué **no** demuestra.
- Recursos externos contextualizados: MITRE ATT&CK, fuentes de datos ATT&CK, D3FEND y Sigma.
- Modo español/inglés; funciona sin red con eventos sintéticos; los enlaces requieren Internet.
- **Nota:** las reglas de puntuación y las correlaciones son simplificaciones educativas. No son un motor de atribución forense.


## v15 — Biblioteca de evidencias explicadas

Se añade una nueva sección independiente con **9 guías bilingües detalladas**: lectura de logs, phishing, PowerShell, cuentas válidas, web shells, RDP, cifrado de archivos, métricas de detección y Threat Hunting. Cada guía sigue ocho pasos: concepto sencillo, por qué importa, registro simulado desglosado por campos, error habitual, investigación, defensa, pregunta corregida y recursos oficiales. Se puede buscar por concepto o identificador ATT&CK; progreso guardado en el navegador.

Los registros son **sintéticos** y las asociaciones ATT&CK son didácticas, no atribuciones forenses. Los recursos apuntan a la documentación pública, no demuestran los hechos ficticios. No se ejecutan comandos ni ataques.


## v16: Entrenamiento progresivo / Progressive training

Nueva sección de entrenamiento en 3 niveles (guiado, pistas y autónomo), con 3 investigaciones sintéticas, explicación individual de 15 eventos, justificación de decisiones, rúbrica de evaluación transparente, guardado local y exportación JSON. Recursos oficiales enlazados por escenario. No es una simulación de incidentes forenses auténticos. Abre index.html para probar la versión local.

## v17 — Registros explicados / Understanding security telemetry

Nuevo apartado **Registros explicados**, con ocho fichas bilingües de Windows Security (4625 y 4688), Sysmon (Event ID 1), Linux SSH, DNS, HTTP, firewall e identidad en la nube. Cada ficha contiene contexto, registro **100 % sintético**, campos comentados uno por uno, límites de interpretación, siguientes comprobaciones, pregunta autocorregida y fuentes públicas verificables. Los ejemplos no son exportaciones reales ni datos de víctimas.

Abre `index.html` y selecciona **Registros explicados** en el menú izquierdo. Los botones de cada campo despliegan su explicación. El progreso de estas fichas se guarda en `localStorage`, como el resto de la academia. La mayoría de secciones anteriores siguen siendo independientes del nuevo módulo.

Recursos oficiales y de referencia: Microsoft Learn (Event 4625, 4688 y Sysmon), manual OpenSSH, MDN (códigos HTTP), MITRE ATT&CK y CISA. Revisa los enlaces de fuentes antes de usar la información en un entorno productivo, ya que las configuraciones y productos pueden cambiar.

## v18 — Consultas explicadas y enlaces desde el SIEM

- Nuevo menú **Consultas explicadas / Query Academy**: ocho preguntas de investigación con ejemplos paralelos de Splunk SPL, Microsoft KQL y SQL genérico.
- Las consultas mostradas son ilustrativas y requieren adaptar los nombres de tablas, índices y campos a cada plataforma. **No existe un intérprete SPL/KQL/SQL integrado**: al pulsar «Simular consulta», JavaScript aplica un filtro equivalente sobre los mismos registros *sintéticos* disponibles en la consola SIEM. Los resultados no son procedentes de Splunk, Sentinel ni de incidentes reales.
- Selecciona un escenario y un ejemplo, cambia de lenguaje, simula el resultado y pulsa «Explicar» para leer los campos y las limitaciones de la evidencia.
- En la tabla del SIEM se añade «Explicar evento», que abre la misma ficha contextual.
- La biblioteca enlaza con referencias oficiales de Splunk, Microsoft KQL, PostgreSQL, MITRE y Sigma. Para entrenamiento defensivo únicamente.


## Novedades v19 — Correlación avanzada

- Sección **Correlación avanzada** en el menú lateral, con tres casos ficticios originales (phishing e identidad, documentos y PowerShell, y ransomware).
- Registros de distintas fuentes: correo, DNS, identidad, procesos, red, copia de seguridad y alertas.
- Selector de ventanas temporales ±5, ±15, ±30 y ±120 minutos, con explicaciones del compromiso entre ruido y cobertura.
- Modo guiado y autónomo, reconstrucción cronológica, justificación escrita, evaluación orientativa, exportación JSON y persistencia local de resultados.
- Material conceptual sobre correlación frente a causalidad y referencias educativas a MITRE, Microsoft y Sigma.

**Nota de precisión**: los registros son completamente sintéticos. La puntuación compara solo selección de eventos contra etiquetas educativas; el informe de texto no se evalúa automáticamente. No se realiza un procesamiento real de telemetría externa.


## v20 — Forense digital

Nuevo módulo `forensics.js`: cinco microlecciones bilingües (preservación, hashes, Windows, Linux, cronologías) con analogías, artefactos ficticios comentados, test razonados, cuaderno exportable JSON y simulación de correlación temporal. La prueba SHA-256 usa la API Web Crypto local; si no está disponible bajo file://, abrir mediante `python3 -m http.server 8000` y visitar `http://localhost:8000`. Los registros son ficticios, los recursos enlazan documentación externa y el contenido no constituye procedimiento probatorio o legal.

## v21 — Memoria y artefactos forenses

Nueva sección «Memoria y artefactos / Memory lab», accesible desde el menú lateral. Incluye cuatro microlecciones bilingües (captura RAM, procesos padre-hijo, sockets/conexiones y artefactos de archivos), cada una con registro sintético anotado campo por campo, analogía, pregunta con explicación y enlaces técnicos. También incluye un ejercicio de investigación con cinco registros desordenados, selección de evidencias, evaluación razonada, cuaderno local y exportación JSON. Todos los registros son ficticios; no se capturan datos del dispositivo ni se realizan acciones sobre sistemas reales. La sección es didáctica y **no ejecuta Volatility ni herramientas forenses reales**. Abrir `index.html` localmente y seleccionar «Memoria y artefactos».


## v23 — Respuesta ante incidentes / Incident Response

Nueva sección en la navegación con tres escenarios sintéticos (identidad, ransomware y servidor web). Seis fases por escenario: evaluación, contención, preservación, erradicación, recuperación y lecciones aprendidas. Cada fase ofrece tres decisiones, justificación posterior y referencias a NIST, CISA y MITRE. Incluye registro de notas, guardado local y exportación JSON. Las respuestas son orientativas y no sustituyen los planes operativos reales. Ninguna acción afecta a equipos o redes.


## V26 — Repaso razonado

Nuevo panel **Repaso razonado / Reasoned review**: 18 situaciones educativas de ocho áreas, niveles inicial/intermedio/avanzado, razonamiento y feedback individual para cada opción, repaso de errores, enlaces directos a MITRE cuando aplica, progreso local y exportación JSON. Los casos son sintéticos y no constituyen material forense real. Este módulo complementa los cuestionarios anteriores; todavía no los sustituye uno a uno.

## v27 — Expedientes prácticos ampliados

Nueva sección **Expedientes ampliados** con cuatro casos ficticios, totalmente diferenciados de los incidentes históricos: phishing y credenciales, Word/PowerShell, ransomware y servidor web. Cada caso incluye organización, actores implicados, situación inicial, impactos operativos, tres etapas de evidencias simuladas, incertidumbres, pasos recomendados, tres preguntas razonadas con comentarios sobre todas las alternativas y enlaces a MITRE o documentación técnica. Las respuestas se guardan en localStorage y se pueden exportar a JSON. Existe un enlace al módulo SOC clásico para continuar la práctica. Los nuevos expedientes están escritos en español e inglés. Las preguntas anteriores se mantienen sin cambios: la mejora transversal se hará por fases.


## v28 — Laboratorio de decisiones con consecuencias (nuevo)

Sección «Decisiones y consecuencias»: tres casos sintéticos de compromiso de cuenta, posible ransomware y servidor web expuesto. Cada caso presenta organización, necesidades de continuidad, alerta inicial, cuatro decisiones progresivas con tres alternativas y una explicación de **cada** opción. Los tres indicadores simulados (contención, continuidad, calidad de evidencias) cambian según las elecciones. No son métricas reales, sino un modelo para enseñar compensaciones operativas. Posibilidad de volver a etapas previas, reiniciar un caso, guardar apuntes, exportar JSON y cambiar de idioma. No realiza acciones externas. Enlaces a NIST SP 800-61r3, CISA y MITRE ATT&CK.


## V29 — Panel personal y orientación formativa

- Nueva sección **Mi aprendizaje** integrada en el menú.
- Evaluación inicial de 8 situaciones con retroalimentación individual y opción de reiniciar solo ese cuestionario.
- Cuatro rutas conectadas con módulos existentes; recomendación orientativa según resultados.
- Lectura real del avance de las 12 unidades de itinerarios (localStorage), sin fingir integrar puntuaciones incompatibles.
- Contenido bilingüe y guardado local. Sin conexión a servidor ni certificación oficial.
- Abre `index.html`, elige **Mi aprendizaje**.

## V30 — Misiones formativas completas

Nueva sección **Misiones formativas / Learning missions**: tres escenarios sintéticos (phishing y credenciales, DNS periódico, cambios masivos de archivos), organizados en cinco etapas desbloqueables: situación empresarial, preparación teórica y fuentes oficiales, selección de evidencias con explicación, decisiones razonadas e informe del analista. Incluye almacenamiento local independiente, exportación JSON, enlaces a módulos existentes y textos en español/inglés. Las puntuaciones de respuestas cerradas no equivalen a una certificación ni califican el texto libre. Todas las pruebas son sintéticas.


## V31 — Modo experto y terminal simulada

El menú **Modo experto / Expert tools** incorpora seis prácticas de comandos comentados: Windows Get-WinEvent, Linux journalctl, sha256sum/Get-FileHash, tshark, SQL de agregación y lectura de reglas YARA. Cada práctica explica objetivo, sintaxis, supuestos, precauciones, salida ficticia, pregunta razonada y recursos oficiales. Las respuestas acertadas se registran localmente.

**Seguridad y límites:** el campo de terminal solo reconoce la cadena de ejemplo y presenta salida preescrita. No interpreta ni ejecuta comandos, no realiza análisis de malware y no accede a equipos o redes. Los comandos reales dependen de permisos, versión, rutas y entorno, y están destinados a laboratorios o sistemas autorizados. Los ejemplos de SQL se adaptan al esquema de datos real.


## Versión 31: modo experto
Se añade una sección con seis ejercicios guiados de comandos defensivos: Get-WinEvent, journalctl, sha256sum, tshark, SQL y lectura de YARA. Cada ejercicio dispone de ejemplo, explicación de sus componentes, terminal simulada, salida ficticia, interpretación razonada y referencia a documentación técnica. La progresión se guarda localmente.

La terminal no ejecuta comandos y las salidas no proceden de sistemas reales. Las órdenes solo deben probarse en sistemas autorizados y con rutas, permisos y versiones apropiadas.


## V32 — Laboratorio de herramientas defensivas

Nueva sección con cinco prácticas educativas: Sysmon, Zeek, Suricata, Velociraptor y Volatility 3. Comandos de referencia explicados por parámetros, dos salidas simuladas por herramienta, preguntas con justificación, notas, persistencia local, exportación JSON, enlaces a documentación oficial y acceso a misiones. **No ejecuta comandos** ni recopila información de equipos o redes. Algunas herramientas exigen instalación, permisos, reglas o artefactos disponibles según la versión; las salidas son sintéticas y no se deben interpretar como resultados garantizados.

## V33 — Laboratorio de investigación integrada

Nuevo apartado «Investigación integrada / Integrated lab» con tres expedientes empresariales sintéticos:
- Factura inesperada (Sysmon, Windows Event Logs, Zeek): proceso, DNS y acceso de cuenta.
- Portal de proveedores (journalctl, Velociraptor, Suricata): peticiones HTTP, archivos y alertas.
- Servidor de archivos (eventos Windows, sha256sum, Volatility 3): procesos, integridad y memoria.

**Cómo utilizarlo:** selecciona un caso, lee la historia y el objetivo, abre al menos dos fuentes de evidencias, examina el comando y su salida sintética, responde la pregunta y abre su corrección. Redacta un informe con hechos, hipótesis, incertidumbre y siguientes acciones. Exporta el informe JSON si lo deseas.

El botón «Preparación del laboratorio y errores comunes» explica el uso de máquinas virtuales aisladas y enlaza a las guías oficiales de las herramientas. Los comandos se ofrecen para estudiar y son orientativos según versiones y configuración; **no se ejecutan** desde la web. La simulación no contiene datos de víctimas, direcciones reales atribuidas a ataques ni muestras maliciosas. Progreso y notas guardados exclusivamente en localStorage.

**Limitación:** la evaluación comprueba la opción seleccionada, no revisa semánticamente el informe escrito. Las relaciones entre eventos y las puntuaciones son un material docente, no conclusiones forenses.
