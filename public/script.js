document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const messageDiv = document.getElementById('message');
    const dropZone = document.getElementById('dropZone');

    // Agregar eventos para arrastrar y soltar
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            showMessage('Archivo cargado correctamente', 'success');
        }
    });

    uploadBtn.addEventListener('click', processFile);

    async function processFile() {
        const file = fileInput.files[0];
        if (!file) {
            showMessage('Por favor selecciona un archivo', 'error');
            return;
        }

        try {
            const data = await readFile(file);
            if (validateData(data)) {
                await sendWebhook(data);
                showMessage('Archivo procesado y enviado correctamente', 'success');
            }
        } catch (error) {
            showMessage('Error: ' + error.message, 'error');
        }
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd'});
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    let jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                        raw: false,
                        dateNF: 'yyyy-mm-dd'
                    });

                    // Normalizar nombres de columnas
                    jsonData = jsonData.map(row => {
                        const normalizedRow = {};
                        for (const [key, value] of Object.entries(row)) {
                            // Convertir nombre de columna a minúsculas y reemplazar espacios con guiones bajos
                            const normalizedKey = key.toLowerCase().replace(/\s+de\s+/g, '_').replace(/\s+/g, '_');
                            normalizedRow[normalizedKey] = value;
                        }
                        return normalizedRow;
                    });

                    console.log('Datos normalizados:', jsonData); // Para debugging
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Error al leer el archivo: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsArrayBuffer(file);
        });
    }

    function validateData(data) {
        // Validar que haya datos
        if (!data || !data.length) {
            throw new Error('El archivo está vacío');
        }

        // Validar estructura de columnas
        const requiredColumns = ['nombre', 'apellidos', 'tipo_documento', 'numero_documento', 'ciudad'];
        const headers = Object.keys(data[0]).map(header => header.toLowerCase());
        
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        if (missingColumns.length) {
            throw new Error(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`);
        }

        // Validar cada fila
        data.forEach((row, index) => {
            // Validar que no haya campos vacíos
            requiredColumns.forEach(column => {
                if (!row[column] || row[column].toString().trim() === '') {
                    throw new Error(`Fila ${index + 1}: El campo ${column} es requerido`);
                }
            });

            // Validar tipo de documento
            const tiposDocumentoValidos = ['cc', 'ce', 'pasaporte'];
            if (!tiposDocumentoValidos.includes(row.tipo_documento.toLowerCase())) {
                throw new Error(`Fila ${index + 1}: Tipo de documento no válido. Debe ser uno de: ${tiposDocumentoValidos.join(', ')}`);
            }

            // Validar número de documento (solo números)
            if (!/^\d+$/.test(row.numero_documento)) {
                throw new Error(`Fila ${index + 1}: El número de documento debe contener solo números`);
            }
        });

        return true;
    }

    async function sendWebhook(data) {
        try {
            // Añadir el campo empresa a los datos
            const dataWithCompany = data.map(item => ({
                ...item,
                empresa: 'wingo'
            }));

            const response = await fetch('https://workflows.ops.sandbox.cuentamono.com/webhook/f5aee968-719a-4bb5-9915-7493b7b7394f', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataWithCompany)
            });

            if (!response.ok) {
                throw new Error('Error al enviar los datos');
            }
        } catch (error) {
            throw new Error('Error de conexión al enviar los datos');
        }
    }

    function showMessage(message, type) {
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        messageDiv.className = `message ${type}`;
    }
}); 