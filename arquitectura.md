# Modelo Conceptual y Jerarquía de Infraestructura (S-124)

Este documento detalla el modelo estructural del sistema, abstrayendo las entidades técnicas (clases Java de la base de datos PING) en conceptos arquitectónicos para facilitar la configuración de zonas geográficas y administrativas.

## 1. Definiciones Conceptuales y Relaciones

El sistema se cimienta sobre 5 entidades estructurales clave que vinculan la geografía con la administración marítima.

*   **Area (Área)**
    *   **Concepto:** Entidad geopolítica raíz o región principal (ej. "Venezuela" o "Mar Caribe"). Posee las fronteras generales y el código de país.
    *   **Relaciones en BD:** Es 100% independiente en su nivel más básico. Posee una relación recursiva _One-to-Many_ consigo misma (`borderAreas`) para definir colindancias con otras áreas.
*   **SubArea (Subárea)**
    *   **Concepto:** División geográfica menor y específica contenida dentro de un Área (ej. "Golfo de Venezuela" o "Puerto de La Guaira").
    *   **Relaciones en BD:** Pertenece directamente a un `Area` madre (_Many-to-One_). Es jerárquica, por lo que admite subáreas hijas (_One-to-Many_). Se enlaza a los canales de transmisión a través de una relación _Many-to-Many_ con `Serie`.
*   **MaritimeService (Servicio Marítimo)**
    *   **Concepto:** Representa la institución gubernamental, autoridad u organismo responsable de administrar y producir datos (ej. "SHN - Venezuela" o "Capitanía de Puertos").
    *   **Relaciones en BD:** Ejerce jurisdicción sobre múltiples áreas geográficas (_One-to-Many_ hacia `Area`). Opera como la entidad matriz que agrupa múltiples entidades marítimas físicas (_One-to-Many_ hacia `MaritimeEntity`).
*   **MaritimeEntity (Entidad Marítima)**
    *   **Concepto:** Representa infraestructuras, oficinas o instalaciones físicas operativas dentro del mar o la costa (ej. Estaciones de Radio Navtex, sedes de Capitanías, puertos comerciales).
    *   **Relaciones en BD:** Pertenece operativamente a un único `MaritimeService` principal (_Many-to-One_). Puede ser monitoreada/utilizada por servicios adicionales (_Many-to-Many_) y se asienta geográficamente en diversas áreas (_One-to-Many_ hacia `Area`).
*   **Serie (Serie)**
    *   **Concepto:** Canal lógico y reglamentario de radiodifusión o publicación de avisos (ej. "NAVAREA IV", "Avisos Costeros", "Avisos Locales"). Define qué tipo de alerta se transmite.
    *   **Relaciones en BD:** Su existencia está atada obligatoriamente a un `MaritimeService` (_One-to-One_ mandatorio; un servicio es el emisor oficial de la serie). Se proyecta geográficamente asociándose a múltiples `SubArea`s (_Many-to-Many_).

## 2. Orden Estricto de Creación (Flujo de Trabajo)

Para implementar el sistema desde un estado vacío (Clean Slate) sin incurrir en errores de llaves foráneas o campos obligatorios (`@NotNull`), el administrador del SHN debe registrar las entidades en este orden cronológico estricto:

1.  **Area**: Entidad raíz sin dependencias foráneas requeridas. Provee el lienzo geográfico.
2.  **SubArea**: Depende del `Area` (requiere que exista la región madre para contenerla).
3.  **MaritimeService**: Depende del `Area`. Se requieren las áreas base para asignar el polígono de jurisdicción a la autoridad.
4.  **MaritimeEntity**: Depende del `MaritimeService` y del `Area`. Exige que exista la autoridad que la administra y el mapa donde se ubica.
5.  **Serie**: Eslabón final de la cadena de emisión. Exige la preexistencia obligatoria del `MaritimeService` (quien la emite) y de las `SubArea`s (hacia dónde se emite).

## 3. Diagrama Conceptual (Dependencias y Jerarquía)

El siguiente modelo ilustra el flujo de dependencias lógicas. Las flechas indican hacia dónde "mira" una entidad (ej. una Subárea *requiere* un Área para existir).

```mermaid
flowchart TD
    %% Nodos de Entidad
    A["Area <br/> <i>(Región Base)</i>"]
    SA["SubArea <br/> <i>(Zonas Locales)</i>"]
    MS["MaritimeService <br/> <i>(Autoridad / SHN)</i>"]
    ME["MaritimeEntity <br/> <i>(Estaciones / Puertos)</i>"]
    SR["Serie <br/> <i>(Canal de Avisos)</i>"]

    %% Dependencias Core (Orden de Creación)
    A -->|"Contiene geográficamente"| SA
    A -->|"Define jurisdicción de"| MS

    MS -->|"Administra físicamente"| ME
    A -->|"Da ubicación a"| ME

    MS -->|"Es dueño absoluto de"| SR
    SA -->|"Recibe las emisiones de"| SR

    %% Estilos (Opcional para renderizado)
    classDef geography fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef administration fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef broadcasting fill:#fff3e0,stroke:#e65100,stroke-width:2px;

    class A,SA geography;
    class MS,ME administration;
    class SR broadcasting;
