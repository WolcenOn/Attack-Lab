# Contribuir a ATT&CK LAB

## Flujo sugerido

1. Abre una incidencia describiendo problema, público afectado y comportamiento esperado.
2. Crea una rama de trabajo desde `main` (por ejemplo `docs/...`, `feature/...` o `fix/...`).
3. Mantén cambios pequeños y conserva el diseño y la navegación existentes.
4. Actualiza esta documentación cuando cambien la interfaz, las rutas o los contenidos educativos.
5. Comprueba localmente y crea un Pull Request con descripción y evidencias de prueba.
6. Fusiona en `main` solo después de revisar el resultado.

## Revisiones mínimas

- Sintaxis de JavaScript verificada.
- Sin enlaces locales ni imports rotos.
- Navegación comprobada (desktop y móvil cuando sea posible).
- Contenido entendible, con fuentes oficiales y correcciones razonadas.
- Datos simulados claramente etiquetados.
- Sin secretos, credenciales, información de víctimas ni datos personales en commits.
- Sin afirmar que una función fue probada visualmente si solo se validó su sintaxis.

## Convenciones recomendadas

- Nombres de archivos claros y estables.
- Separar contenido de presentación conforme se refactorice, sin desplazar módulos masivamente.
- Respetar `data-view` y selectores existentes al tocar la navegación.
- Describir qué funciona offline y qué requiere conexión.
- Incluir capturas (sin información sensible) cuando el cambio sea visual.

## Descripción de Pull Request

```md
## Objetivo
¿Qué mejora y para quién?

## Cambios
- ...

## Pruebas realizadas
- [ ] Sintaxis JS
- [ ] Navegación y scripts
- [ ] Interacción en navegador
- [ ] Vista móvil
- [ ] Documentación y fuentes

## Riesgos o limitaciones
...
```

## Derechos y procedencia

Consulta el archivo `LICENSE` antes de reutilizar o redistribuir contenidos. Cita las fuentes originales de incidentes, herramientas y técnicas; no atribuyas a MITRE contenidos didácticos propios del proyecto.
