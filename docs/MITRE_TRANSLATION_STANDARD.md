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

## Estado real después de este primer lote de traducciones íntegras

| Familia | Descripciones completas ES en este contrato | Total original |
| --- | ---: | ---: |
| DS — Fuentes de datos históricas | **42** | **42** |
| A — Activos industriales ICS | **18** | **18** |
| T, TA, DET, AN, DC, S, G, C, M | **0 contabilizadas como completas por este contrato** | Pendiente de auditoría por familia |

Las **60 descripciones completas** de DS y A están redactadas en `mitre-full-descriptions-es-v20.js`; son borradores pendientes de revisión humana, aunque todos los registros de ambas categorías tienen una traducción de su descripción original. Se conserva la capa antigua de *resúmenes educativos* para las familias que todavía no tienen traducción íntegra, incluidos los avances realizados en PR previos.

**Advertencia de alcance:** la cifra cero en la última fila mide *exclusivamente este nuevo contrato de traducción íntegra*, **no niega** los títulos o resúmenes en español ya existentes. La prioridad de los lotes siguientes será trasladar paulatinamente todas las familias al mismo contrato, atendiendo además a campos narrativos anidados. No está traducido al completo el catálogo MITRE v20.
