# Historial MITRE ATT&CK y materiales de documentación

## Procedencia

Este apartado se ha extraído de **`docs.rar`**, una copia facilitada para el proyecto del directorio de documentación de MITRE ATT&CK. La extracción se centra en los ficheros `docs/changelogs/*/changelog.json`.

**Importante:** representa el contenido de un archivo aportado al proyecto, **no un feed oficial actualizado en tiempo real**. Debe distinguirse del catálogo v20 que incluye `data/mitre/v20/`, donde se consultan las fichas de técnicas, software y detecciones. Una entrada de cambio histórica no describe automáticamente el estado vigente de un código.

La fuente de referencia pública es [MITRE ATT&CK: versiones y recursos](https://attack.mitre.org/resources/versions/). MITRE ATT&CK y sus contenidos son propiedad de The MITRE Corporation, publicados con los términos de uso disponibles en https://attack.mitre.org/resources/terms-of-use/.

## Qué se incorpora al repositorio

- `data/mitre/history/manifest.json` — 28 transiciones desde v7.2→v8.0 hasta v19.2→v20.0, recuentos y nombres de fragmentos.
- `data/mitre/history/changes-00.json` a `changes-06.json` — **15.430 eventos de cambio** asignados a **5.758 IDs distintos**, conservando identificador, nombre original, categoría, dominio y tipo de modificación. Los eventos se calculan a partir de los objetos `changelog.json` que llevan un `external_id` de MITRE. Los eventos sin identificador público quedan fuera del índice, sin inferirles uno.
- `data/mitre/history/mobile-crosswalk.json` — equivalencias históricas de subtécnicas Mobile procedentes de `docs/subtechniques/mobile-subtechniques-crosswalk.json`. Es un recurso histórico: comprobar el código vigente en la ficha de referencia antes de reutilizar una equivalencia.
- `src/features/learning/mitre-history.js` — vista de consulta por versión, código, dominio, tipo y acción. Los fragmentos se cargan **solo al abrir la vista**; la búsqueda global entre versiones carga siete JSON ligeros.

**Formato de cada evento:** `[id, dominio, categoría, tipo_de_cambio, nombre_en]`, agrupado bajo la clave de transición de versión. Las categorías y acciones se referencian por índice en `manifest.json`; los dominios son `E` (Enterprise), `M` (Mobile) e `I` (ICS).

Se mantienen las categorías del changelog: adiciones, cambios mayores/menores, otras revisiones, correcciones, revocaciones, obsolescencias y eliminaciones. Las acciones son **eventos de cambio**, no certificados de vulnerabilidad ni indicadores de compromiso.

## Otros archivos presentes en el RAR

El archivo contiene **701 entradas** contando directorios, con unos **457 MB descomprimidos**. Entre los documentos no duplicados se encuentran:

- **444 hojas XLSX** de publicaciones históricas de Enterprise, Mobile e ICS, en versiones desde v9.0 hasta v20.0.
- **21 recursos del taller de formación de inteligencia de amenazas (CTI)**, entre ellos presentaciones, ejercicios de comparación de capas de Navigator y casos de APT39/Cobalt Kitty.
- Manuales y planes de emulación APT3, archivos de cambios detallados en HTML y capas Navigator históricas.

**No se suben al sitio los PDF, XLSX o HTML completos** de este archivo. Son materiales grandes o redundantes frente al catálogo actual. Se conserva únicamente el índice estructurado y la tabla de equivalencias. Si en el futuro se integra un documento individual, debe conservar su versión, procedencia, derechos y finalidad educativa.

## Estudiar cambios de versiones (2.º ASIR)

1. Abre **Aprendizaje → Historial MITRE** y selecciona `v19.2 → v20.0`.
2. Busca un código `Txxxx`, `Txxxx.xxx`, `DETxxxx` o `ANxxxx` y observa si cambió en esa transición.
3. Selecciona **Buscar en 28 transiciones** para comparar el historial archivado de ese identificador.
4. Diferencia una incorporación de un cambio menor, una revocación o una obsolescencia. No confundas la ausencia de cambios con la ausencia de la técnica.
5. Abre el catálogo local para consultar la ficha actual archivada de v20 y contrasta con la documentación original.

## Cómo actualizarlo con nuevos archivos

1. Conserva el archivo original sin modificar y registra fecha, versión, dominio y procedencia.
2. Extrae sus `changelog.json` en un directorio **fuera** de los archivos servidos por la web.
3. Ejecuta `python scripts/import_mitre_changelogs.py --source /ruta/a/docs/changelogs --output data/mitre/history`.
4. Compara recuentos, transiciones e IDs con la versión anterior y revisa las diferencias antes de fusionar.
5. Mantén las traducciones educativas por separado; los nombres oficiales en inglés en el índice histórico no se presentan como traducciones revisadas.

Cuando un nuevo documento no encaje en el changelog, se debe crear un extractor específico y probarlo antes de ampliar el manifest general.
