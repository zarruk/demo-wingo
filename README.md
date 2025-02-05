# Demo Bolívar

Portal web para la creación de tarjetas de clientes Bolívar. Este portal permite cargar archivos Excel/CSV con información de clientes y enviarla a través de un webhook.

## Formato del archivo

El archivo debe ser un Excel o CSV con las siguientes columnas:
- Nombre
- Apellidos
- Tipo de documento
- Número de documento
- Ciudad
- Departamento
- País
- Código postal
- Teléfono (10 dígitos)
- Dirección
- Monto
- Descripción
- Fecha de nacimiento (YYYY-MM-DD)
- Email

Puedes descargar un [archivo de ejemplo aquí](https://docs.google.com/spreadsheets/d/1OfMnApAQJZythFPNQ_1aGEWwFR-ZniUj8ArmHvUa79w/edit?gid=0).

## Instalación

1. Clona este repositorio
2. Abre el archivo `index.html` en un servidor web local

## Uso

1. Arrastra un archivo Excel/CSV o haz clic para seleccionarlo
2. Presiona "Procesar archivo"
3. El sistema validará los datos y los enviará al webhook configurado 