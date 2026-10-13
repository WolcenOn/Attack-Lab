# Cómo escribir contenido educativo de calidad

## Objetivo

Cada lección, subtécnica, pregunta y escenario debe permitir que una persona entienda **qué ocurre, por qué importa, cómo comprobarlo, qué puede hacer para defenderse y dónde aprender más**. No basta con marcar una respuesta como correcta.

## Plantilla recomendada para una lección

1. **Título e identificador:** código ATT&CK si corresponde.
2. **Requisitos previos:** conocimientos necesarios y enlace a la lección anterior.
3. **Explicación sencilla:** tres a seis frases sin jerga innecesaria.
4. **Analogía opcional:** breve y claramente limitada (una analogía no demuestra un hecho).
5. **Situación realista:** entorno empresarial, activos, responsable, impacto posible y objetivo del alumno.
6. **Hechos disponibles:** origen, marca temporal, sistema y campos de evidencia.
7. **Análisis guiado:** explicar campo por campo, qué indica, qué no indica y qué dato falta.
8. **Hipótesis alternativas:** al menos una explicación legítima plausible.
9. **Acciones defensivas:** prevención, detección, contención y limitaciones.
10. **Pregunta aplicada:** ¿qué harías después y por qué?
11. **Corrección razonada:** explicar todas las opciones, incluida la acertada.
12. **Recursos:** fuentes oficiales pertinentes con una frase sobre qué consultar.
13. **Etiquetado:** sintético, hecho documentado, inferencia o propuesta educativa.

## Plantilla recomendada para un caso

**Organización y contexto:** sector, sistemas, servicio crítico, responsables y restricciones.

**Alerta:** quién la detectó, cuándo, con qué sensor y qué anomalía reporta.

**Cronología:** observaciones ordenables (con zona horaria), no una historia de ataque presupuesta.

**Evidencias:** identificador único, fuente, contenido, interpretación, fiabilidad, relación con ATT&CK.

**Decisiones:** opciones razonables con posibles costes y consecuencias; evitar una única respuesta universal si depende del contexto.

**Evaluación:** qué se evalúa automáticamente, qué requiere evaluación humana y qué información aún no puede demostrarse.

**Cierre:** hechos confirmados, hipótesis, incertidumbres, próximos pasos y fuentes.

## Estándar para preguntas

- Preguntar por interpretación, evidencia faltante o elección proporcionada, no solo por memoria.
- Asegurar que la opción correcta está respaldada por el escenario.
- Incluir alternativas incorrectas **plausibles**; no caricaturas.
- Explicar una a una todas las alternativas.
- Evitar «demuestra» o «confirma» cuando los datos solo sugieren.
- Añadir la pista o concepto necesario antes de evaluar, especialmente en modo principiante.

### Ejemplo

**Registro sintético:** `parent=WINWORD.EXE child=powershell.exe`.

**Pregunta:** ¿qué conclusión se sostiene mejor?

A. Demuestra una infección.

B. Merece revisar contexto, argumentos y actividad posterior.

C. Siempre es normal.

**Corrección:** B. El árbol de procesos puede resultar inusual, pero no basta para confirmar un ataque. A salta a una conclusión; C descarta sin comprobar.

## Fuentes y atribución

- Enlazar a MITRE ATT&CK para el comportamiento, a Microsoft/Linux/Wireshark/etc. para campos y comandos, y a informes primarios para incidentes históricos.
- Separar incidente documentado de reconstrucción ficticia, y mapeo analítico de atribución oficial.
- Indicar fecha o versión si una referencia cambia con el tiempo.
- Nunca presentar salida inventada como un registro recogido de una víctima real.

## Accesibilidad e idiomas

- Priorizar español natural, sin suprimir términos técnicos relevantes: introducirlos y definirlos.
- Mantener el significado en inglés cuando se traduzca.
- No prometer traducción completa si existen fragmentos solo en inglés.
- Explicar abreviaturas, proporcionar ejemplos y permitir revisar la corrección.

## Seguridad

Trabajar únicamente en laboratorios propios o autorizados. No incluir credenciales reales, datos privados, malware operativo ni indicadores que apunten a víctimas reales. Para direcciones de ejemplo preferir rangos reservados para documentación.
