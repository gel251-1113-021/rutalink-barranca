import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import os

def update_informe_tecnico():
    path = os.path.join('docs', 'Informe_Tecnico_RutaLink_UNAB-v2.docx')
    doc = docx.Document(path)
    
    # 1. Agregar contenido a Capítulo III o V
    doc.add_heading('5.2.3. Módulo Sprint 3: Rutas OSRM, WebSockets Bidireccional, Cabina Digital y Acuerdos 1 a 1', level=3)
    
    p = doc.add_paragraph()
    p.add_run(
        "Durante el Sprint 3 se consolidó la infraestructura de comunicación en tiempo real y el motor geoespacial de rutas "
        "interdistritales para la Provincia de Barranca. Se aplicó el script '03_sprint3_realtime_routes.sql' incorporando geometrías LineString "
        "en PostGIS y el procedimiento almacenado 'get_vehicles_in_bbox()', optimizando el consumo de red en dispositivos móviles al descartar "
        "unidades fuera de la vista activa del mapa.\n"
    )
    
    # Puntos destacados de Sprint 3
    bullet1 = doc.add_paragraph(style='List Bullet')
    r1 = bullet1.add_run("Trazado Cartográfico de Corredores Viales: ")
    r1.bold = True
    bullet1.add_run("Se proyectan tres rutas troncales formales (Barranca Centro - Campus UNAB, Barranca - Supe Pueblo y Barranca - Pativilca - Paramonga) "
                    "mediante polilíneas vectoriales azul cobalto (#2563eb) con estilo editorial CartoDB Voyager.")
    
    bullet2 = doc.add_paragraph(style='List Bullet')
    r2 = bullet2.add_run("WebSockets Bidireccionales con Estrangulamiento GPS: ")
    r2.bold = True
    bullet2.add_run("El servidor Socket.io implementa un filtro de throttling (5 segundos o 15 metros) para la posición de los vehículos, "
                    "previniendo la saturación de conexiones y garantizando fluidez sin drenar la batería del conductor.")
    
    bullet3 = doc.add_paragraph(style='List Bullet')
    r3 = bullet3.add_run("Alerta Auditiva al Conductor (Web Speech API): ")
    r3.bold = True
    bullet3.add_run("Al pulsar 'Esperar aquí' en el mapa, los choferes en circulación reciben una emisión de radio y una notificación audible por voz en español: "
                    "'Nuevo pasajero esperando en la ruta', permitiendo conducir sin desviar la mirada al teléfono.")
    
    bullet4 = doc.add_paragraph(style='List Bullet')
    r4 = bullet4.add_run("Inspección Táctil de Cabina Digital y Equipaje: ")
    r4.bold = True
    bullet4.add_run("Los usuarios pueden pulsar 'Ver Cabina Digital' en cualquier unidad para visualizar el plano 2D en vivo, verificando qué asientos "
                    "están libres o tomados y el volumen de carga disponible en bodega o parrilla.")
    
    bullet5 = doc.add_paragraph(style='List Bullet')
    r5 = bullet5.add_run("Salas Efímeras de Acuerdo 1 a 1: ")
    r5.bold = True
    bullet5.add_run("Módulo de negociación auditada donde el pasajero y el chofer coordinan punto exacto de recojo y tarifa pactada antes de subir, "
                    "con registro inmutable para auditoría y seguridad.")
                    
    bullet6 = doc.add_paragraph(style='List Bullet')
    r6 = bullet6.add_run("Refinamiento Visual en Modo Claro: ")
    r6.bold = True
    bullet6.add_run("Siguiendo las pautas de diseño visual, se estableció el Modo Claro por defecto estructurado sobre blanco puro (#ffffff), "
                    "azul corporativo (#2563eb / #1e40af) y negro carbón (#0f172a), sustituyendo elementos toscos por tarjetas con bordes tenues y "
                    "pasteles armónicos para estados (esmeralda suave, rosa atenuado y ámbar).")

    doc.save(path)
    print("Informe Técnico actualizado con Sprint 3.")

def update_manual_usuario():
    path = os.path.join('docs', 'Manual_Funcionalidades_y_Guia_Usuario_RutaLink.docx')
    doc = docx.Document(path)
    
    doc.add_heading('5. GUÍA DE USO: RUTAS INTERDISTRITALES, CABINA DIGITAL Y ACUERDOS 1 A 1 (SPRINT 3)', level=1)
    
    p = doc.add_paragraph()
    p.add_run(
        "El Sprint 3 habilita al pasajero y conductor herramientas de interacción visual y pacto seguro. "
        "A continuación se detallan los pasos para operar estas nuevas funcionalidades:\n"
    )
    
    # 5.1 Buscador Inteligente
    doc.add_heading('5.1. Buscador "¿A dónde vas?" y Chips Rápidos', level=2)
    p1 = doc.add_paragraph()
    p1.add_run("1. En la parte inferior del mapa, deslice la tarjeta (Bottom Sheet) hacia arriba o use la barra de búsqueda rápida.\n"
               "2. Escriba el destino deseado (ej. 'UNAB', 'Supe', 'Pativilca') o pulse uno de los chips sugeridos ('UNAB Campus', 'Supe Pueblo', 'Paramonga').\n"
               "3. El mapa filtrará automáticamente los paraderos, vehículos y rutas correspondientes, trazando la polilínea azul oficial.")

    # 5.2 Inspección de Cabina Digital
    doc.add_heading('5.2. Inspección de Cabina Digital y Capacidad de Carga', level=2)
    p2 = doc.add_paragraph()
    p2.add_run("1. Al tocar cualquier vehículo en circulación o listado, pulse el botón 'Ver Cabina Digital'.\n"
               "2. Se abrirá el plano 2D del vehículo (Sedán, SUV, Miniván o Combi) mostrando en verde los asientos libres y en rojo los ocupados.\n"
               "3. Podrá revisar si el vehículo cuenta con parrilla superior de equipaje y cuántos kilogramos de carga soporta.")

    # 5.3 Sala Efímera de Acuerdo
    doc.add_heading('5.3. Sala Efímera de Acuerdo 1 a 1', level=2)
    p3 = doc.add_paragraph()
    p3.add_run("1. Al seleccionar un vehículo, pulse 'Conversar Acuerdo'.\n"
               "2. Ingrese el punto de recojo acordado y confirme la tarifa referencial (ej. S/. 3.50 hacia UNAB).\n"
               "3. El chat 1 a 1 permite chatear en tiempo real con el conductor y pulsar 'Aceptar Pacto de Viaje'. La sala queda registrada para fines de trazabilidad.")

    # 5.4 Señal de Espera y Notificación por Voz
    doc.add_heading('5.4. Señal ' + chr(34) + 'Esperar Aquí' + chr(34) + ' y Alerta Audible para Choferes', level=2)
    p4 = doc.add_paragraph()
    p4.add_run("1. Si se encuentra cerca a una ruta o paradero, presione el botón azul 'Esperar aquí'.\n"
               "2. Se activará un marcador pulsante azul sobre su ubicación durante 15 minutos.\n"
               "3. Los choferes que estén circulando con la app abierta recibirán automáticamente un aviso por voz en sus altavoces: "
               "'Nuevo pasajero esperando en la ruta', permitiéndoles detenerse de forma segura.")

    doc.save(path)
    print("Manual de Usuario actualizado con Sprint 3.")

def update_diagramas_arquitectura():
    path = os.path.join('docs', 'Diagramas_Arquitectura_RutaLink.docx')
    doc = docx.Document(path)
    
    doc.add_heading('5. DIAGRAMA DE SECUENCIA: SINCRONIZACIÓN WEBSOCKETS, ESTRANGULAMIENTO GPS Y SÍNTESIS DE VOZ (SPRINT 3)', level=1)
    p1 = doc.add_paragraph()
    p1.add_run(
        "Modela el ciclo de eventos en tiempo real entre pasajeros, choferes y el servidor Socket.io. "
        "Incorpora el algoritmo de estrangulamiento GPS (descarte de updates a menos de 5 seg o menos de 15 metros) "
        "y el disparo de voz sintética Web Speech API en el cliente del conductor.\n"
        "Archivo fuente Mermaid: /docs/diagramas/05_secuencia_websockets_sprint3.mmd\n"
    )

    doc.add_heading('6. ARQUITECTURA DE RUTAS VIALES Y FILTRADO ESPACIAL POR BOUNDING BOX (SPRINT 3)', level=1)
    p2 = doc.add_paragraph()
    p2.add_run(
        "Describe la integración entre el cliente PWA (Next.js/Leaflet), las rutas vectoriales OSRM/GeoJSON "
        "y el motor PostGIS ejecutando la función 'get_vehicles_in_bbox()'. "
        "Esto garantiza que únicamente las unidades contenidas dentro del encuadre geográfico visible se transmitan por la red.\n"
        "Archivo fuente Mermaid: /docs/diagramas/06_arquitectura_rutas_bbox_sprint3.mmd\n"
    )

    doc.save(path)
    print("Diagramas de Arquitectura actualizado con Sprint 3.")

if __name__ == '__main__':
    update_informe_tecnico()
    update_manual_usuario()
    update_diagramas_arquitectura()
