# Procedimiento único de traducción de MITRE ATT&CK v20

## Objetivo y categorías

Se aplica **exactamente el mismo procedimiento de traducción** a cada familia del catálogo local: **T** (técnicas y subtécnicas), **TA** (tácticas), **DET** (estrategias), **AN** (analíticas), **DC** (componentes), **DS** (fuentes históricas), **A** (activos ICS), **S** (software), **G** (grupos), **C** (campañas) y **M** (mitigaciones). No se debe dar por completamente traducida una categoría solo porque los títulos o un subconjunto de resúmenes estén en español.

### Definición de estados

| Estado | Qué se puede afirmar | Etiqueta en la interfaz |
| --- | --- | --- |
| `pending` | No hay descripción completa en español. Puede existir título o resumen propio. | «Original en inglés», o «Resumen educativo…» si existe |
| `draft_needs_review` + `scope: full_description` | Se ha traducido íntegramente el campo fuente `description_en`. La revisión humana aún está pendiente. | «Descripción íntegra … (borrador)» y acceso al original |
| `reviewed_es` | Solo tras revisión bilingüe por una persona responsable; **no se asigna automáticamente**. | «Traducción revisada» |

**Un resumen educativo no equivale a una traducción completa.** Debe mantenerse identificado como comentario didáctico; aunque tenga un título español, no incrementa el contador de *descripciones íntegras*.

## Secuencia obligatoria, idéntica para cada categoría

1. **Sincronizar y verificar la base:** consultar último `main` y los PR abiertos. Crear rama propia desde `main`. No modificar un PR ajeno en curso ni fusionar automáticamente.
2. **Inventariar la familia:** leer el manifiesto y todos los registros fuente de `data/mitre/v20/`. Registrar identificadores válidos, dominios, cantidad de entradas y todos los campos descriptivos que aparecen en la interfaz.
3. **Traducir todo el contenido de descripción aplicable:** conservar significado, matices, incertidumbre de atribución, ejemplos, siglas, referencias y condiciones. No inventar información ausente ni sustituir «podría» por «demuestra». Los nombres propios, IDs, nombres de eventos, comandos y claves técnicas mantienen su identidad; cuando proceda se explican en español. Conservar las referencias como `[1]`.
4. **Almacenar por separado:** añadir una entrada en un *overlay* español con el mismo ID y metadatos `{description,scope:'full_description',status:'draft_needs_review'}`. Jamás sobrescribir los JSON MITRE v20 ni su contenido inglés, sus IDs, vínculos o telemetría. El contrato uniforme está implementado en `src/features/learning/mitre-full-descriptions-es-v20.js` y es reutilizable para otras familias.
5. **Mostrar el resultado de la misma forma:** modo ES con título en español cuando esté disponible y **descripción íntegra ES**, claramente marcada como borrador pendiente de revisión; descripción inglesa fuente íntegra en desplegable. Modo EN con original inglés sin ocultar. Sin traducción completa, mostrar el resumen docente si existe, diferenciado del original, o el original inglés si no existe.
6. **Indexar ambas lenguas:** buscar por código, título original, título español, texto español completo y campos ya indexados. No cambiar la identidad de la entrada ni su relación con técnicas, DET, AN o componentes.
7. **Auditar y probar:** cotejar cada ID del overlay con la versión fuente, comprobar cobertura total de la familia, textos no vacíos, no duplicados, sin alteración del inglés; probar escritorio/móvil, ES→EN→ES, recuperación del original, relaciones, avisos históricos y casos todavía sin traducción. Ejecutar tanto las comprobaciones estáticas como Playwright.
8. **Revisión humana y PR:** documentar cobertura real y limitaciones. Abrir un PR contra `main` con resultados de CI; **dejar la fusión al mantenedor**. Solo una revisión bilingüe posterior puede cambiar el estado de borrador a revisado.

## Campos anidados y excepciones obligatorias

Para acreditar la **traducción de una ficha completa**, no basta necesariamente con `description_en`:

- **DET/AN:** revisar la estrategia y todas sus analíticas asociadas. Cada AN tiene `description_en`; los elementos configurables pueden incluir `mutable_elements[].description_en`. Mantener literalmente IDs DET/AN, plataformas, fuentes, campos y canales de registro.
- **T, TA, M, DC, A, S, G y C:** revisar también campos narrativos adicionales realmente presentados, cuando los haya. Mantener los enlaces MITRE y la terminología de plataformas, software, aliases, fechas y atribuciones.
- **DS:** son **fuentes de datos históricas u obsoletas** en la instantánea v20. Traducirlas no las convierte en fuentes actuales ni elimina sus avisos.
- **Nombres propios y atribuciones:** no traducir arbitrariamente nombres de campañas, software o grupos; conservar las reservas y los grados de certeza del texto original.

## Cobertura de descripciones íntegras en el contrato v20 (DS/A, TA y M)

| Familia | Descripciones completas ES en este contrato | Total original |
| --- | ---: | ---: |
| DS — Fuentes históricas obsoletas | **42** | **42** |
| A — Activos industriales ICS | **18** | **18** |
| TA — Tácticas Enterprise, Mobile e ICS | **39** | **41** (39 con `description_en`) |
| M — Mitigaciones ICS | **53** | **53** |
| M — Mitigaciones Mobile | **13** | **13** |
| M — Mitigaciones Enterprise | **43** | **43** (0 pendientes) |
| T, DET, AN, DC, S, G, C | **0 contabilizadas como íntegras por este contrato** | Pendiente de auditoría |

Se conservan las **60 traducciones DS/A** en `mitre-full-descriptions-es-v20.js`, las **39 TA** en `mitre-tactics-descriptions-es-v20.js` y las **109 M** (53 ICS + 13 Mobile + 43 Enterprise) en `mitre-mitigations-descriptions-es-v20.js`. Los tres módulos se consultan a través de `window.AttackFullSpanishV20`; su contador suma **208 traducciones del campo completo `description_en`**, todas con `scope: 'full_description'` y `status: 'draft_needs_review'`. No han recibido revisión humana y no son traducciones oficiales MITRE.

De 41 tácticas, las dos Mobile **TA0038 y TA0039** carecen de `description_en` y `short_en` en el original; mantienen sus resúmenes didácticos, sin contarse como traducciones íntegras. Las otras 39 tácticas con descripción inglesa sí están traducidas.

Las 109 mitigaciones M tienen `description_en`. En este lote quedan cubiertas todas las **53 ICS** y **13 Mobile**; están traducidas las **43 Enterprise**; no quedan descripciones M pendientes. Las fichas M mantienen sus relaciones documentadas con técnicas, la descripción inglesa y los enlaces de versión. Se han comprobado los IDs y las referencias `[n]` contra el JSON local para las 109 mitigaciones traducidas. El texto histórico de M1009 acerca de la intención de Apple de exigir App Transport Security se reproduce como aparece en la instantánea v20; no se actualiza silenciosamente con datos externos. La anomalía inglesa «release values» en M0805 también se señala sin sustituirla silenciosamente por otro término. En las mitigaciones M, el archivo fuente no incorpora otros campos narrativos anidados; sus `techniques` son relaciones estructuradas y no se traducen.

**Primer lote Enterprise:** las doce fichas traducidas son M1017, M1020, M1021, M1029, M1031, M1037, M1039, M1041, M1042, M1053, M1056 y M1060. Se han traducido todos sus párrafos, casos de uso, medidas, herramientas y comandos de `description_en`. En **M1029** el ejemplo de reenvío de Suricata está incompleto en la instantánea inglesa (`outputs: type: syslog protocol: tls address:`), y el comando con `nc <remote-log-server> 514` se reproduce como ejemplo de la fuente, **no como procedimiento validado de producción**. Se conservaron sin correcciones técnicas silenciosas; requieren contraste humano.

**Segundo lote Enterprise (12 nuevas fichas):** M1015, M1016, M1018, M1019, M1022, M1024, M1025, M1026, M1027, M1028, M1030 y M1032. Se han traducido las descripciones inglesas íntegras, incluidos casos de uso, recomendaciones, referencias a productos, comandos y rutas. Se preserva la terminología original cuando es un identificador técnico (`RunAsPPL`, `CVE-XXXX-XXXX`, `HKLM:\\...\\Run`, `icacls`). Los ejemplos de comandos y parámetros proceden de la fotografía v20 y **no se han verificado como procedimientos seguros de ejecución**. En particular, **M1027** atribuye a `pwunconv` la desactivación de la reutilización de contraseñas y **M1018** recomienda una caducidad de 90 días: se preservan fielmente como contenido de la fuente, sin presentarlos como consejo actualizado o validado. La comprobación bilingüe humana y la validación técnica específica siguen pendientes.

**Lote final Enterprise (19 nuevas fichas):** M1033, M1034, M1035, M1036, M1038, M1040, M1043, M1044, M1045, M1046, M1047, M1048, M1049, M1050, M1051, M1052, M1054, M1055 y M1057. En este contrato queda cubierta la totalidad de las **109 descripciones de mitigación**: 53 ICS, 13 Mobile y 43 Enterprise. Se han conservado las medidas individuales, casos de uso, nombres de herramientas, comandos, advertencias y referencias `[n]` del original. La categoría **M1055 (Do Not Mitigate)** se traduce sin convertirla en una recomendación de mitigación preventiva. El campo inglés `description_en` y los datos estructurados permanecen intactos. La revisión de traducciones y recomendaciones técnicas por una persona bilingüe sigue siendo necesaria; **«109/109» mide cobertura de borradores completos, no calidad revisada ni equivalencia con traducciones oficiales MITRE**.

**Advertencia de alcance:** «0» en la última fila mide solamente las traducciones completas amparadas por el contrato, no los títulos, equivalencias o resúmenes educativos españoles existentes. No está completamente traducido el catálogo MITRE v20, ni la revisión automática sustituye a la revisión humana bilingüe.
