# Activos ICS A — traducciones propuestas MITRE ATT&CK v20

Este lote incorpora una capa **separada de los JSON oficiales** con traducciones españolas propuestas de la descripción completa de **12 de los 18 activos ICS**: A0001–A0012. El alcance real es **12/18 (66,67 %) en descripciones**, distinto de los **18/18 títulos y resúmenes educativos** existentes. Las seis descripciones A0013–A0018 siguen pendientes. No se afirma cobertura integral de ATT&CK v20.

## Consultar

Abrir [el visor bilingüe de activos](../assets-es-v20.html) en un servidor web estático. Permite buscar por ID, título original, título español, resumen educativo o texto de la traducción propuesta. En español distingue claramente **resumen educativo propio** y **traducción propuesta de la descripción MITRE**; el original inglés permanece en un desplegable. En inglés se muestra la descripción MITRE original sin contenido traducido.

Los overlays se encuentran en `src/features/learning/mitre-assets-descriptions-es-v20.js` (A0001–A0006) y `mitre-assets-descriptions-es-v20-part2.js` (A0007–A0012). Se cargan en ese orden. Cada entrada declara `kind: proposed_full_translation` y `status: draft_needs_review`. **Ninguna ha superado revisión humana**, por lo que no debe atribuirse a MITRE una traducción oficial. Los nombres propios, referencias como [1], protocolos, IDs, metadatos y relaciones originales no se alteran.

## Validación y límites

Ejecutar `python3 scripts/validate_mitre_v20.py` y `npx playwright test tests/e2e/mitre-assets-translations-es.spec.cjs`. Las pruebas verifican 12 IDs únicos presentes en el archivo v20, la ausencia de modificaciones a los originales, la búsqueda en español, la apertura del texto inglés, la alternancia ES/EN y el comportamiento de una ficha aún pendiente.

Este visor es una **ruta estática independiente**, todavía no está enlazado desde la navegación principal. La integración en el explorador general, la revisión técnica y lingüística y la traducción de los seis activos restantes están pendientes. No se han modificado las 42 fuentes DS históricas, marcadas como obsoletas.

Fuente y atribución: [MITRE ATT&CK v20 — activos](https://attack.mitre.org/assets/). © 2026 The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation. ATT&CK LAB es independiente de MITRE.
