# Cobertura de códigos MITRE ATT&CK en «Evidencias explicadas»

## Dos niveles de contenido

1. **Lecciones comentadas**: las lecciones originales, redactadas y revisadas a mano, incluyen evidencias sintéticas anotadas campo a campo, preguntas y bibliografía.
2. **Todos los códigos Txxxx**: catálogo complementario enlazado al explorador ATT&CK. Al cargar el dataset oficial Enterprise, permite encontrar cada **técnica/subtécnica activa de ese dominio** por ID, nombre o táctica; no se limita a las lecciones redactadas a mano.

La vista ofrece nombre y código MITRE, tácticas, descripción original (en inglés), enlace a la ficha oficial y **una guía inicial en español** sobre el contexto de esa táctica, observaciones defensivas posibles, incertidumbre y un ejemplo inventado. Se muestran títulos españoles revisados para un conjunto de códigos frecuentes; para otros se conserva el nombre inglés, identificado como no traducido. **Una guía por táctica no sustituye una explicación específica y revisada de cada técnica.** El indicador de calidad en la ficha lo deja claro.

## Fuente y extracción

No se hace scraping de las páginas HTML. El explorador ya descarga bajo petición el conjunto oficial STIX 2.1 de MITRE:

- [Repositorio oficial de datos STIX ATT&CK](https://github.com/mitre-attack/attack-stix-data)
- [Colección actual de Enterprise](https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json)
- [Documentación de consumo de STIX](https://github.com/mitre-attack/attack-stix-data/blob/master/USAGE.md)
- [Licencia de ATT&CK](https://github.com/mitre-attack/attack-stix-data/blob/master/LICENSE.txt)

La descarga es grande (decenas de MB), **requiere Internet y no se realiza automáticamente** para proteger tiempo y datos móviles. En modo offline hay únicamente una muestra de técnicas. Solo se incluyen registros activos de ATT&CK **Enterprise**; códigos retirados, revocados y dominios **Mobile/ICS** pueden no figurar. La ausencia de una técnica en la muestra offline no indica que no exista.

**Atribución:** © 2026 The MITRE Corporation. ATT&CK® data used with permission under MITRE's license. ATT&CK LAB es independiente y no es un producto oficial de MITRE.

## Interpretación defensiva y versiones

Las señales ilustrativas se generan a partir de **14 plantillas educativas por táctica**, nunca de un registro forense ni de una detección oficial específica del ID consultado. Las descripciones oficiales se muestran en su idioma original y truncadas para lectura; nunca se etiquetan como traducción aprobada.

Desde ATT&CK v18 (2025), las estrategias de detección y analíticas utilizan nuevos objetos **DETxxxx/ANxxxx**, y las antiguas fuentes de datos y el campo `x_mitre_detection` están obsoletos. Un futuro sistema de evidencias **específicas por técnica** deberá enlazar las relaciones STIX de detección actualizadas y revisarlas antes de redactar explicaciones y traducciones. No se debe presentar una plantilla por táctica como si MITRE publicara un log concreto.

## Mantenimiento y siguientes pasos

- Añadir traducciones y microlecciones revisadas por técnica, empezando por las más estudiadas en ASIR y las asociadas a casos reales.
- Generar en una fase posterior un **índice reducido y versionado** para consultar todos los IDs offline sin almacenar los 50 MB de STIX en el repositorio.
- Incorporar DET/AN vinculados por STIX, procedencia y cobertura, sin inventar evidencias.
- Construir pruebas de regresión de versión: total de IDs, subtécnicas, descontinuaciones, enlaces y cambios de nombre.
