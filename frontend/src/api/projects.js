import client from './client';

export const getProjects = () => client.get('/projects').then((r) => r.data.projects);

export const addProject = (payload) => client.post('/projects', payload).then((r) => r.data.project);

export const updateProject = (id, payload) =>
  client.put(`/projects/${id}`, payload).then((r) => r.data.project);

export const deleteProject = (id) => client.delete(`/projects/${id}`).then((r) => r.data);

// `files` is an array of { uri, name, mimeType } picked via document/image picker
export const addAttachments = async (projectId, files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    });
  });

  const response = await client.post(`/projects/${projectId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => {
          if (evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      : undefined,
  });
  return response.data.project;
};

export const deleteAttachment = (projectId, attachmentId) =>
  client.delete(`/projects/${projectId}/attachments/${attachmentId}`).then((r) => r.data.project);
