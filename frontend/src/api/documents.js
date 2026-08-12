import client from './client';

export const getDocuments = () => client.get('/documents').then((r) => r.data.documents);

// `file` is the object returned by expo-document-picker: { uri, name, mimeType }
export const uploadDocument = async (file, title, category, onProgress) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  });
  formData.append('title', title);
  if (category) formData.append('category', category);

  const response = await client.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => {
          if (evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      : undefined,
  });
  return response.data.document;
};

export const deleteDocument = (id) => client.delete(`/documents/${id}`).then((r) => r.data);
