# Auditoría Forense: Tipos de Serie y Doctrina S-124

Este documento detalla el mapeo técnico entre la selección en la interfaz de usuario, la codificación en el backend (Java) y la serialización final en el XML del estándar S-124, basándose estrictamente en el código fuente de PING.

## 1. Mapeo de Enums (Backend)

En el backend, los 9 valores presentados en el frontend están gobernados por el archivo `SerieType.java` y se traducen a códigos numéricos específicos del S-124 en `WarningType.java`:

**Advertencias a la Navegación (Warnings):**
*   `NAVAREA_NAVIGATIONAL_WARNING` (Código S-124: 4)
*   `SUB_AREA_NAVIGATIONAL_WARNING` (Código S-124: 3)
*   `COASTAL_NAVIGATIONAL_WARNING` (Código S-124: 2)
*   `LOCAL_NAVIGATIONAL_WARNING` (Código S-124: 1)

**Avisos a los Navegantes (Notices):**
*   `LOCAL_NOTICE_TO_MARINER` (Código interno PING: 180)
*   `PORT_NOTICE_TO_MARINER` (Código interno PING: 190)

**Avisos Temporales y Preliminares (Notices T/P):**
*   `TEMPORARY_NOTICE_TO_MARINER` (Código S-124: 13)
*   `PRELIMINARY_NOTICE_TO_MARINER` (Código S-124: 14)
*   `TEMPORARY_AND_PRELIMINARY_NOTICE_TO_MARINER` (Código interno PING: 200)

## 2. Definiciones Doctrinales (Implementación PING / S-124)

> **Nota técnica:** El código fuente carece de JavaDocs extensos, pero la vinculación directa de estas constantes a los identificadores enteros del estándar S-124 (1 al 14) refleja la adopción de la doctrina IHO S-53. Las categorías fuera del rango 1-17 (ej. 180, 190, 200) son extensiones personalizadas de PING.

*   **NAVAREA:** Avisos de alcance oceánico transmitidos típicamente por Inmarsat (SafetyNET) para la navegación de altura.
*   **Sub-Area / Coastal:** Avisos transmitidos por NAVTEX para buques navegando en aguas nacionales o zonas marítimas compartidas (hasta ~250 millas de la costa).
*   **Local / Port (1, 180, 190):** Avisos para aguas interiores, ríos o jurisdicciones portuarias, a menudo transmitidos por VHF.

**Diferencia Técnica en Avisos T/P:**
*   **Aviso Temporal (13):** Se utiliza para alteraciones temporales de la infraestructura (ej. un faro apagado temporalmente o una boya corrida). Su estado volverá a la normalidad, por lo que el mapa base no se alterará permanentemente.
*   **Aviso Preliminar (14):** Alerta temprana de un cambio físico permanente que se avecina (ej. un cable submarino que está siendo tendido o la construcción de un nuevo muelle). Advierte al navegante antes de que se emita la nueva carta náutica oficial.
*   **Aviso Temporal y Preliminar (200):** Es un código de agrupación personalizado en el sistema PING. Permite a los administradores crear una *única* "Serie" en la base de datos que agrupe orgánicamente a ambos tipos de avisos en el frontend, en lugar de forzarlos a crear dos series separadas.

## 3. Traducción al XML del S-124

En la fase de serialización y envío a los buques (o al robot), el sistema invoca la clase `S124v2MessageSeriesIdentifierDto.java` y `S124v2Util.java`.

El valor seleccionado se inyecta exactamente en la etiqueta XML:
`<S124:warningType code="[CÓDIGO]">`

*Ejemplo de generación en el código (`S124v2Util.java` línea 390):*
El sistema ejecuta `WarningType.fromSerieTypeAndWarningHazardTypeGeneral(warning.getSerie().getType(), warning.getWarningHazardTypeGeneral())`, lo cual resuelve el `WarningType` (ej. `TEMPORARY_NOTICE_TO_MARINER`). Luego extrae su propiedad `code` (ej. `13`) y la serializa como atributo de `<S124:warningType>`.
