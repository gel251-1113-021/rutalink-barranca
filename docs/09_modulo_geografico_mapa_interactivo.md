# Módulo Geográfico y Mapa Interactivo — RutaLink Barranca

Este documento describe la arquitectura, capacidades geoespaciales, capas cartográficas y experiencia táctil del núcleo geográfico de **RutaLink Barranca** sobre el estándar **WGS84 (EPSG:4326)** y **PostGIS**.

---

## 1. Coordenadas y Ámbito Geográfico Provincial

El sistema cubre integralmente la provincia de Barranca y sus ejes de movilidad urbana, interdistrital y universitaria:

| Zona / Hito | Latitud (WGS84) | Longitud (WGS84) | Tipo de Cobertura |
| :--- | :--- | :--- | :--- |
| **Barranca Centro (Plaza de Armas / Jr. Gálvez)** | `-10.7523` | `-77.7622` | Núcleo comercial, base de colectivos |
| **Campus UNAB (Universidad Nacional de Barranca)** | `-10.7428` | `-77.7485` | Eje universitario principal (km 192) |
| **Terminal Terrestre Interprovincial** | `-10.7550` | `-77.7600` | Interconexión con Lima, Huacho y Huaraz |
| **Hospital de Barranca (Emergencias)** | `-10.7490` | `-77.7580` | Punto de asistencia y salud pública |
| **Playa Chorrillos y Malecón** | `-10.7580` | `-77.7695` | Zona turística y costanera |
| **Supe Pueblo (Centro)** | `-10.7981` | `-77.7135` | Corredor interdistrital sur |
| **Puerto Supe (Muelle y Terminal)** | `-10.8035` | `-77.7420` | Caleta pesquera y puerto |
| **Óvalo de Pativilca (Cruce Panamericana)** | `-10.6974` | `-77.7831` | Enlace vial norte hacia el Callejón de Huaylas |
| **Paramonga (Centro y Fortaleza)** | `-10.6720` | `-77.8180` | Eje agroindustrial y patrimonio histórico |

---

## 2. Motor de Cartografía y Selector Discreto de Capas

El mapa incorpora un selector flotante discreto de capas cartográficas (`BarrancaMap.tsx`) accesible con un solo toque desde cualquier pantalla:

1. **Mapa Vial Estándar (Google Maps / Cartografía Urbana):**
   * *Modo Claro:* Calles, avenidas, giros y referencias oficiales con alto contraste para uso diurno.
   * *Modo Nocturno:* Conmutación automática o manual a teselas oscuras de alta visibilidad para choferes en turno de noche (`CartoDB Dark`).
2. **Vista Satelital (Satelital Puro):**
   * Cobertura de imágenes satelitales nítidas (`lyrs=s`), indispensable para caminos rurales, valles agrícolas de Pativilca, Supe y zonas no pavimentadas.
3. **Vista Híbrida (Satélite + Calles):**
   * Fusión de fotografía satelital de alta resolución con la nomenclatura oficial de calles, carreteras y puntos de referencia superpuestos (`lyrs=y`).
4. **Capa de Tráfico en Tiempo Real:**
   * Visualización en vivo de la densidad de tráfico (`lyrs=m,traffic`) con líneas verdes (fluido), amarillas (moderado) y rojas (congestión), ideal para el tramo Panamericana Norte y el mercado central.

---

## 3. Marcado de Posiciones Reales en el Mapa (Estilo Google Maps)

* **Toque Directo o Arrastre (Pin Magnético):**
  Cualquier usuario puede pulsar en cualquier pista o punto del mapa para fijar un pin de precisión (`📍`).
* **Geocodificación Inversa en Tiempo Real:**
  El sistema calcula la intersección o calle más cercana y sus coordenadas WGS84 exactas con 6 decimales.
* **Tarjeta de Acción Rápida Flotante:**
  Al marcar el punto, se despliega una tarjeta contextual con:
  * Dirección o referencia vial aproximada.
  * Botón **"Pedir Recojo Aquí (Pactar Carrera)"** para acordar traslado desde esa posición.
  * Botón **"Guardar como Punto de Espera"** para notificar a los choferes de la zona.
  * El pin es arrastrable (`draggable: true`), recalculando la dirección en tiempo real al soltarlo.

---

## 4. Buscador Inteligente de Destinos ("¿A dónde vas?")

* **Autocompletado Híbrido:**
  Combina los paraderos registrados en PostGIS con hitos geográficos de Barranca (Campus UNAB, Hospital, Terminal, Plazas, Playas, Mercados y Óvalos).
* **Vuelo Suave de Cámara (`flyTo`):**
  Al seleccionar un destino, la cámara del mapa se desplaza suavemente al punto exacto con zoom 16, fija el marcador de destino y filtra automáticamente los vehículos y líneas que prestan servicio en ese corredor.
* **Cálculo de Distancia y Tiempo Estimado (ETA):**
  Calcula la distancia vial real (km) y el tiempo aproximado en minutos (ETA) considerando la velocidad media de desplazamiento.

---

## 5. Orientación Real de Vehículos y Gestos Táctiles con el Dedo

* **Rumbo Real de Circulación (`heading`):**
  Cada marcador vehicular rota dinámicamente un indicador direccional (`▲`) según su ángulo de movimiento (0° a 360°), permitiendo a los pasajeros saber hacia qué dirección viaja la unidad en la avenida.
* **Expansión y Retracción por Gestos (Touch Drag / Swipe):**
  El panel deslizable inferior (`BottomSheet.tsx`) implementa manejadores táctiles (`onTouchStart`, `onTouchMove`, `onTouchEnd`):
  * **Deslizar hacia arriba con el pulgar:** Expande el panel de estado minimizado (`48px`) a media pantalla (`52vh`) o pantalla completa.
  * **Deslizar hacia abajo:** Retrae el panel suavemente para liberar más del 88% de la pantalla para el mapa interactivo.
  * **Doble interfaz:** Se conservan en todo momento los botones de un solo toque (`[ 🗺️ Ver Lista ]`, `[ ⬇️ Ver Mapa Completo ]`, `[ Expandir / Reducir ]`).
