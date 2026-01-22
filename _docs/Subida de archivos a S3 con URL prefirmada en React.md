# Subida de archivos a S3 con URL prefirmada en React

Te explico cómo implementar la subida de archivos a S3 usando URLs prefirmadas, sin necesidad de librerías adicionales de AWS en el frontend.

## No necesitas librerías de S3 en el frontend

Cuando usas URLs prefirmadas, **no necesitas `aws-sdk` ni `@aws-sdk/client-s3`** en el frontend. Solo necesitas hacer una petición HTTP PUT con el archivo.

## Código del servicio de subida

```javascript
// services/s3Upload.js

export const uploadToS3 = async (file, presignedUrl, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Monitorear el progreso de subida
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        if (onProgress) {
          onProgress(percentComplete);
        }
      }
    });

    // Manejar la finalización exitosa
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // La URL del objeto es la URL prefirmada sin los query parameters
        const objectUrl = presignedUrl.split('?')[0];
        resolve({
          success: true,
          objectUrl,
          status: xhr.status,
        });
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Manejar errores
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    // Configurar y enviar la petición
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};
```

## Alternativa con fetch y ReadableStream

Si prefieres usar `fetch` (más moderno pero con limitaciones para progreso):

```javascript
// services/s3Upload.js

export const uploadToS3WithFetch = async (file, presignedUrl) => {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    // Obtener la URL del objeto
    const objectUrl = presignedUrl.split('?')[0];

    return {
      success: true,
      objectUrl,
      status: response.status,
    };
  } catch (error) {
    throw new Error(`Upload error: ${error.message}`);
  }
};
```

## Componente React con seguimiento de progreso

```javascript
import React, { useState } from 'react';
import { uploadToS3 } from './services/s3Upload';

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [objectUrl, setObjectUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
      setUploadProgress(0);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      // 1. Obtener la URL prefirmada de tu backend
      const presignedUrlResponse = await fetch('/api/get-presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      });

      const { presignedUrl } = await presignedUrlResponse.json();

      // 2. Subir el archivo a S3
      const result = await uploadToS3(selectedFile, presignedUrl, (progress) => {
        setUploadProgress(progress);
      });

      // 3. Archivo subido exitosamente
      setObjectUrl(result.objectUrl);
      setUploadComplete(true);
      console.log('Archivo subido a:', result.objectUrl);
    } catch (err) {
      setError(`Error al subir el archivo: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Subir archivo a S3</h2>

      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        className="mb-4 block w-full text-sm"
      />

      {selectedFile && (
        <p className="mb-2 text-sm text-gray-600">Archivo seleccionado: {selectedFile.name}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {uploading ? 'Subiendo...' : 'Subir archivo'}
      </button>

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-center mt-2">{uploadProgress}%</p>
        </div>
      )}

      {uploadComplete && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700 font-semibold">¡Subida completada!</p>
          <p className="text-sm mt-2 break-all">URL del objeto: {objectUrl}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
```

## Ejemplo de backend (Node.js) para generar URL prefirmada

```javascript
// Backend - Ejemplo con Express y AWS SDK v3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'us-east-1' });

app.post('/api/get-presigned-url', async (req, res) => {
  const { fileName, fileType } = req.body;

  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: 'tu-bucket-name',
    Key: key,
    ContentType: fileType,
  });

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hora
    });

    res.json({
      presignedUrl,
      key, // Útil para referencia posterior
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Resumen de puntos clave

1. **No necesitas librerías de AWS en el frontend** - Solo HTTP PUT
2. **XMLHttpRequest** permite monitorear el progreso de subida fácilmente
3. **La URL del objeto** es la URL prefirmada sin los query parameters
4. **El progreso** se calcula con `event.loaded / event.total * 100`
5. **La subida termina** cuando `xhr.status` es 200-299

Esta solución es eficiente, segura y te da control total sobre el proceso de subida con feedback visual para el usuario.
