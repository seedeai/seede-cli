import { getToken, getApiUrl } from './config.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getToken();
    if (token) {
        headers.Authorization = `${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || errorData.error || response.statusText;
        throw new Error(`API Error: ${message} (${response.status})`);
    }
    return response.json();
};

const request = async (endpoint, options = {}) => {
    const url = `${getApiUrl()}${endpoint}`;
    const headers = getHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        return handleResponse(response);
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
};

export const login = async (data) => {
    return request('/sign-in', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const register = async (data) => {
    return request('/sign-up', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const sendVerificationCode = async (email, language = 'en') => {
    return request('/account/send-email-verification', {
        method: 'POST',
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            language
        })
    });
};

export const sendSmsCode = async (phone, countryCode, language = 'en') => {
    return request('/account/send-sms-code', {
        method: 'POST',
        body: JSON.stringify({
            phone: phone.trim(),
            country_code: countryCode.trim(),
            language
        })
    });
};

export const createTask = async (data) => {
    return request('/api/task/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const getTask = async (taskId) => {
    return request(`/api/task/${taskId}`);
};

export const getTaskStatus = async (taskId) => {
    return request(`/api/task/${taskId}/status`);
};

export const listTasks = async () => {
    return request('/api/task/list');
};

export const getModels = async () => {
    const res = await request('/api/task/models');
    return res.models || [];
};

export const listDesigns = async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
        }
    });
    const queryString = searchParams.toString();
    return request(queryString ? `/project?${queryString}` : '/project');
};

const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

const calculateMd5 = (data) => {
    return crypto.createHash('md5').update(data).digest('hex');
};

const retryAsync = async (fn, retries = 3, delay = 800) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryAsync(fn, retries - 1, delay * 1.5);
    }
};

export const uploadAsset = async (filePath, meta = {}, onProgress = null) => {
    // 1. Read file and convert to dataURL
    const buffer = await fs.readFile(filePath);
    const mimeType = getMimeType(filePath);
    const base64 = buffer.toString('base64');
    const dataURL = `data:${mimeType};base64,${base64}`;
    const filename = path.basename(filePath);

    // 2. Handle SVG auto naming (simplified)
    if (mimeType === 'image/svg+xml' && !meta.filename) {
        meta.filename = filename;
    }

    // 3. Get dimensions (skipped for now as we don't want extra deps, backend handles it)
    // const dimensions = ...

    // 4. Construct upload data
    const uploadData = {
        name: meta.filename || filename,
        parent_id: '',
        size: buffer.length,
        source: meta.source || 'import',
        type: meta.type || 'user',
        contentType: mimeType,
        contentHash: calculateMd5(dataURL), // Hash of the dataURL string
        meta: {
            ...meta,
            // w: dimensions?.width,
            // h: dimensions?.height,
        },
    };

    if (onProgress) onProgress({ phase: 'uploading', progress: 0 });

    // 6. Upload interface & remote distribution with retry
    let result;
    try {
        result = await retryAsync(
            async () => {
                return await request('/asset', {
                    method: 'POST',
                    body: JSON.stringify(uploadData),
                });
            },
            3, // retries
            800 // initial delay
        );
    } catch (error) {
        throw new Error(`Upload init failed: ${error.message}`);
    }

    // 7. OSS / Direct upload logic
    try {
        const { url } = result;
        if (url) {
            await retryAsync(
                async () => {
                    if (url.type === 'oss') {
                        // OSS Upload (Presigned URL usually)
                        // Assuming url.host is the PUT url for OSS
                        // Or we need to construct it from ossMeta
                        // The snippet says: url: url.host, ossMeta: url
                        // For simplicity, we assume url.host or url.signedUrl is the target
                        // If it's a standard presigned PUT:
                        const uploadUrl = url.signedUrl || url.host; // Adjust based on actual API

                        // If it's standard OSS presigned PUT
                        await fetch(uploadUrl, {
                            method: 'PUT',
                            body: buffer,
                            headers: {
                                'Content-Type': mimeType
                            }
                        });
                    } else {
                        // Direct upload
                        await fetch(url, {
                            method: 'PUT', // or POST depending on API
                            body: buffer,
                            headers: {
                                'Content-Type': mimeType
                            }
                        });
                    }
                },
                2,
                1000
            );
        }
    } catch (e) {
        console.error('Direct/OSS upload failed, falling back to dataURL upload:', e.message);
        // Fallback: PUT /asset/:id with dataURL
        const { asset } = result;
        if (asset && asset.id) {
            await retryAsync(
                async () => {
                    return await request(`/asset/${asset.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            dataURL,
                        }),
                    });
                },
                3,
                800
            );
        } else {
            throw e;
        }
    }

    return result.asset;
};

export const uploadFile = async (filePath) => {
    return uploadAsset(filePath);
};

export default {
    login,
    register,
    createTask,
    getTask,
    listTasks,
    getModels,
    listDesigns,
    uploadFile,
    uploadAsset
};
