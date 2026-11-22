# Especificación Técnica y Arquitectura de Evolución
## RutaLink Barranca: Red Comunitaria de Movilidad Provincial y Coordinación Vial

---

## 1. Diagnóstico Profundo: Sistema de Cuentas y Cierre de Sesión al Recargar

### 1.1 Causa Raíz Técnica del Fallo de Sesión
El síntoma reportado (*"se cierra la sesión cada vez que se recarga la página"*) se debe a una combinación de tres factores en la arquitectura actual:

1. **Asincronía de Hidratación en `AuthContext`:** Al recargar la página, `isGuest` se calcula como `!user`. Como `user` inicia en `null` mientras `getSession()` se resuelve en la red, toda la aplicación evalúa instantáneamente `isGuest === true`, desmontando vistas autenticadas antes de que Supabase termine de responder.
2. **`signUp` sin Sesión Inicial (Confirmación Pendiente):** Por defecto, Supabase Auth requiere verificación por correo. Si el usuario no ha abierto el correo o si la confirmación está activa en el proyecto, `data.session` es `null`. `localStorage` no guarda ningún JWT, por lo que al primer F5 la sesión se evapora.
3. **Desconexión con `public.profiles`:** Si la tabla `public.profiles` tiene políticas RLS restrictivas o no encuentra el registro del usuario recién creado, `fetchProfile` falla silenciosamente y no hidrata los datos del rol activo.

### 1.2 Solución Técnica para Producción
* **Guardia de Hidratación (`AuthGuard`):** Ningún componente operativo decidirá si el usuario es invitado hasta que `isLoading === false`. Mientras carga, se renderiza una estructura esquelética neutra o el splash de inicio.
* **Auto-Login Transparente:** Al registrarse, si el backend o Supabase aceptan el registro, se invoca automáticamente `signInWithPassword` para forzar la emisión y almacenamiento del token JWT en `localStorage`.
* **Sincronización en Cookies de Sesión:** Almacenamiento redundante de la sesión en cookies seguras (`SameSite=Lax`, `Secure`), permitiendo que el servidor y el cliente reconozcan la sesión inmediatamente sin parpadeos.

---

## 2. Sistema de Comunicación Interno (Análogo a WhatsApp)

RutaLink no debe tener solo un modal pasivo de "Grupos", sino un **Centro de Coordinación Vial en Tiempo Real**:

### Requerimientos Funcionales del Chat
1. **Interfaz Móvil Nativa:** Lista de conversaciones con foto/avatar, última hora de mensaje, contador de no leídos y estado (En línea / Hace X min).
2. **Burbujas de Mensaje Diferenciadas:** Remitente en azul marino/verde, destinatario en gris pizarra neutro, con checks de estado (✓ enviado, ✓✓ entregado).
3. **Píldoras de Acción Rápida (Smart Chips):** Botones predefinidos para evitar que el conductor o pasajero escriban mientras se mueven:
   * *"Estoy en la esquina"*
   * *"¿Cuántos asientos te quedan?"*
   * *"Llego en 3 minutos"*
   * *"Me bajo en el siguiente cruce"*
4. **Acuerdo de Carrera Embebido:** Si dos usuarios chatean en privado, pueden presionar *"Enviar Oferta de Pasaje"* y fijar el precio dentro de la misma conversación (ej. *"Propuesta: S/ 4.00 a Campus UNAB"* con botones de *Aceptar* / *Contraofertar*).

---

## 3. Núcleo Cartográfico WGS84 Provincial Completo

Basándonos en la cartografía real de la Provincia de Barranca (incorporando la topografía de los valles de **Fortaleza**, **Pativilca** y **Supe** de la imagen proporcionada):

### Capacidades Requeridas
1. **Detección de Autos Cercanos ("Vehículos Cerca de Mí"):**
   * El mapa calculará la distancia en metros entre el GPS del pasajero y cada unidad activa mediante la fórmula de Haversine o la función PostGIS `ST_DistanceSphere`.
   * Unidades a menos de **1.5 km** se destacan con una aureola sutil y tiempo estimado de llegada (ETA en minutos).
2. **Buscador Inteligente con Jerga y Referencias Locales:**
   * Reconocimiento de nombres cotidianos de Barranca: *"Frente a Metro"*, *"Bajada Chorrillos"*, *"Puerta UNAB"*, *"Óvalo Pativilca"*, *"Muelle Supe"*, *"Entrada a Caral"*, *"Fortaleza"*, *"Cruce Paramonga"*.
3. **Trazo Vial Estricto por Calles:**
   * Las líneas de ruta siguen el asfalto real de la Panamericana Norte y arterias urbanas (Jr. Gálvez, Av. Primavera, Av. Luzuriaga, Carretera a Supe), eliminando cualquier vector directo que atraviese manzanas o cerros.

---

## 4. Catálogo Digital de Vehículos y Buses Universitarios (UNAB)

Para superar soluciones privadas básicas y abarcar todo el parque automotor provincial:

| Categoría | Capacidad | Configuración de Cabina | Caso de Uso en Barranca |
| :--- | :--- | :--- | :--- |
| **Mototaxi Torito** | 3 Pasajeros | Chofer adelante + Fila posterior (P1, P2, P3) | Tránsito urbano rápido, mercado, terminal |
| **Auto Colectivo / Sedán** | 4 Pasajeros | Copiloto + 3 asientos traseros | Colectivos rápidos Barranca - Pativilca / Supe |
| **Station Wagon (Parrilla)** | 4 Pasajeros + Carga | Asientos + Capacidad de carga 120 kg | Compras de mercado, carga rural, encomiendas |
| **Miniván Colectivo** | 6 Pasajeros | 3 Filas (1+2+3) + Espacio maletas | Servicio frecuente Barranca - UNAB |
| **Combi Interdistrital** | 14 Pasajeros | 4 Filas con pasillo lateral | Líneas troncales interdistritales |
| **Bus Universitario UNAB** | 32 a 45 Asientos | Pasillo central + Filas dobles (2+2) | Traslado masivo de estudiantes a campus |

* **Conexión a Catálogo de Marcas:** El conductor puede elegir su modelo comercial (Toyota Yaris, Toyota HiAce, Bajaj Torito, Hyundai Elantra, Mercedes-Benz Sprinter / Bus Volskwagen UNAB) y el sistema generará automáticamente la plantilla digital con sus dimensiones y asientos reales.

---

## 5. Nueva Identidad Visual y Logotipo Provincial

### Diagnóstico del Diseño Actual
* Los tonos azul/morado con excesivos efectos de desenfoque (*glassmorphism*) y bordes inflados generan sensación de prototipo genérico de inteligencia artificial.
* Se requiere un **diseño de producto utilitario de transporte**: alto contraste bajo luz solar, tipografía geométrica legible en movimiento, y colores oficiales provinciales.

### Concepto del Nuevo Logotipo
Inspirado directamente en la **morfología geográfica de la Provincia de Barranca** (del mapa adjuntado por el usuario):
* **Geometría:** Tres curvas dinámicas que representan los valles fértiles de los **Ríos Fortaleza, Pativilca y Supe**.
* **Eje Conector:** Una línea estilizada en amarillo sol que cruza los tres valles, representando la **Carretera Panamericana Norte** que une Paramonga, Pativilca, Barranca y Supe.
* **Isotipo SVG:** Un pin de navegación cuya mitad izquierda reproduce el litoral costero y su mitad derecha integra las siluetas de la civilización de Caral y la Fortaleza de Paramonga.

---

## 6. Operaciones CRUD Completas y Robustas (Cancelaciones y Bajas)

Ningún flujo puede quedar en un "callejón sin salida". El sistema incorporará de forma transversal:

1. **Gestión de Solicitudes:**
   * Pasajero puede **"Cancelar Solicitud de Parada"** en cualquier momento antes de que el vehículo llegue.
   * Conductor o Pasajero pueden **"Desistir del Acuerdo de Carrera"** con justificación rápida (ej. *"El vehículo demoró mucho"*, *"Cambio de planes"*).
2. **Gestión de Paraderos y Rutas (Para Despachadores y Administradores):**
   * Editar referencias de paraderos en vivo.
   * Eliminar o archivar rutas inactivas sin romper registros históricos de viajes.
3. **Gestión de Flota:**
   * Dar de baja temporal a una unidad (*"Fuera de Servicio por Mantenimiento"*).
   * Modificar la distribución de asientos si el vehículo retiró una fila para carga.
