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
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('El archivo está vacío o tiene un formato incorrecto');
        }

        const requiredFields = {
            'nombre': 'Nombre',
            'apellidos': 'Apellidos',
            'tipo_documento': 'Tipo de documento',
            'numero_documento': 'Número de documento',
            'ciudad': 'Ciudad',
            'departamento': 'Departamento',
            'pais': 'País',
            'codigo_postal': 'Código postal',
            'telefono': 'Teléfono',
            'direccion': 'Dirección',
            'monto': 'Monto',
            'descripcion': 'Descripción',
            'fecha_nacimiento': 'Fecha de nacimiento',
            'email': 'Email'
        };

        data.forEach((row, index) => {
            const missingFields = [];
            
            // Verificar campos faltantes
            for (const [field, label] of Object.entries(requiredFields)) {
                if (!row[field] && row[field] !== 0) {
                    missingFields.push(label);
                }
            }

            if (missingFields.length > 0) {
                throw new Error(`Fila ${index + 1}: Faltan los siguientes campos: ${missingFields.join(', ')}`);
            }

            // Validar teléfono (10 dígitos)
            const phone = row.telefono.toString();
            if (!/^\d{10}$/.test(phone)) {
                throw new Error(`Fila ${index + 1}: El teléfono debe tener 10 dígitos (actual: ${phone})`);
            }

            // Validar que el monto sea un número
            if (isNaN(Number(row.monto))) {
                throw new Error(`Fila ${index + 1}: El monto debe ser un número válido`);
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                throw new Error(`Fila ${index + 1}: El email no tiene un formato válido`);
            }

            // Validar fecha de nacimiento
            const fechaNacimiento = new Date(row.fecha_nacimiento);
            if (isNaN(fechaNacimiento.getTime())) {
                throw new Error(`Fila ${index + 1}: La fecha de nacimiento no tiene un formato válido (debe ser YYYY-MM-DD)`);
            }
        });

        return true;
    }

    async function sendWebhook(data) {
        try {
            const response = await fetch('https://workflows.ops.sandbox.cuentamono.com/webhook/f5aee968-719a-4bb5-9915-7493b7b7394f', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
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