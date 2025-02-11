# Demo Wingo

Portal web para la creación de tarjetas de clientes Wingo. Este portal permite cargar archivos Excel/CSV con información de clientes y enviarla a través de un webhook.

## Formato del archivo

El archivo debe ser un Excel o CSV con las siguientes columnas:
- Nombre
- Apellidos
- Tipo de documento
- Número de documento
- Ciudad

Puedes descargar un [archivo de ejemplo aquí](https://docs.google.com/spreadsheets/d/1OfMnApAQJZythFPNQ_1aGEWwFR-ZniUj8ArmHvUa79w/edit?gid=0).

## Instalación

1. Clona este repositorio
2. Ejecuta `npm install`
3. Ejecuta `npm start`

## Uso

1. Arrastra un archivo Excel/CSV o haz clic para seleccionarlo
2. Presiona "Procesar archivo"
3. El sistema validará los datos y los enviará al webhook configurado 