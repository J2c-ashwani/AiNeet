import { randomUUID } from 'crypto';

export const OMR_SCAN_BUCKET = process.env.OMR_SCAN_BUCKET || 'omr-scans';

export const OMR_SCAN_ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
];

const ALLOWED_MIME_TYPE_SET = new Set(OMR_SCAN_ALLOWED_MIME_TYPES);
const DEFAULT_MAX_BYTES = 15 * 1024 * 1024;

export class OmrScanStorageError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'OmrScanStorageError';
        this.status = status;
    }
}

export function normalizeOmrMimeType(value) {
    const mimeType = String(value || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_MIME_TYPE_SET.has(mimeType)) {
        throw new OmrScanStorageError('Unsupported OMR file type', 415);
    }
    return mimeType;
}

export function normalizeOrInferOmrMimeType(value, imageBase64) {
    if (value) return normalizeOmrMimeType(value);

    const buffer = decodeOmrBase64(imageBase64);
    const inferred = inferMimeTypeFromBuffer(buffer);

    if (!inferred) {
        throw new OmrScanStorageError('Unsupported OMR file type', 415);
    }

    return inferred;
}

export function parseOmrDataUri(dataUri) {
    const match = String(dataUri || '').match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) {
        throw new OmrScanStorageError('Invalid OMR scan data URI', 400);
    }

    return {
        mimeType: normalizeOmrMimeType(match[1]),
        imageBase64: match[2],
    };
}

export function decodeOmrBase64(imageBase64) {
    const normalized = String(imageBase64 || '').replace(/\s/g, '');

    if (!normalized || normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
        throw new OmrScanStorageError('Invalid OMR image payload', 400);
    }

    const buffer = Buffer.from(normalized, 'base64');
    const maxBytes = Number(process.env.OMR_SCAN_MAX_BYTES || DEFAULT_MAX_BYTES);

    if (buffer.length === 0) {
        throw new OmrScanStorageError('Invalid OMR image payload', 400);
    }

    if (buffer.length > maxBytes) {
        throw new OmrScanStorageError('OMR image is too large', 413);
    }

    return buffer;
}

export async function persistOmrScanObject(supabase, { userId, testId, imageBase64, mimeType }) {
    const normalizedMimeType = normalizeOmrMimeType(mimeType);
    const scanBuffer = decodeOmrBase64(imageBase64);
    const path = [
        String(userId).replace(/[^a-zA-Z0-9_-]/g, '_'),
        new Date().toISOString().slice(0, 10),
        `${randomUUID()}.${extensionForMimeType(normalizedMimeType)}`,
    ].join('/');

    const { error } = await supabase.storage
        .from(OMR_SCAN_BUCKET)
        .upload(path, scanBuffer, {
            contentType: normalizedMimeType,
            upsert: false,
        });

    if (error) {
        throw new OmrScanStorageError('OMR scan storage is not configured', 500);
    }

    return {
        type: 'storage',
        version: 1,
        bucket: OMR_SCAN_BUCKET,
        path,
        mimeType: normalizedMimeType,
        sizeBytes: scanBuffer.length,
        testId,
        createdAt: new Date().toISOString(),
    };
}

export async function loadOmrScanObject(supabase, scanReference) {
    if (String(scanReference || '').startsWith('data:')) {
        const legacy = parseOmrDataUri(scanReference);
        return {
            ...legacy,
            sizeBytes: decodeOmrBase64(legacy.imageBase64).length,
            source: 'legacy-data-uri',
        };
    }

    let ref;
    try {
        ref = typeof scanReference === 'string' ? JSON.parse(scanReference) : scanReference;
    } catch {
        throw new OmrScanStorageError('Invalid OMR scan reference', 400);
    }

    if (!ref || ref.type !== 'storage' || !ref.bucket || !ref.path || !ref.mimeType) {
        throw new OmrScanStorageError('Invalid OMR scan reference', 400);
    }

    const mimeType = normalizeOmrMimeType(ref.mimeType);
    const { data, error } = await supabase.storage.from(ref.bucket).download(ref.path);

    if (error || !data) {
        throw new OmrScanStorageError('OMR scan object could not be loaded', 500);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const maxBytes = Number(process.env.OMR_SCAN_MAX_BYTES || DEFAULT_MAX_BYTES);

    if (buffer.length > maxBytes) {
        throw new OmrScanStorageError('OMR image is too large', 413);
    }

    return {
        imageBase64: buffer.toString('base64'),
        mimeType,
        sizeBytes: buffer.length,
        source: 'storage',
    };
}

export function serializeOmrScanReference(ref) {
    return JSON.stringify(ref);
}

function extensionForMimeType(mimeType) {
    switch (mimeType) {
        case 'image/jpeg':
            return 'jpg';
        case 'image/png':
            return 'png';
        case 'image/webp':
            return 'webp';
        case 'image/heic':
            return 'heic';
        case 'image/heif':
            return 'heif';
        case 'application/pdf':
            return 'pdf';
        default:
            return 'bin';
    }
}

function inferMimeTypeFromBuffer(buffer) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }

    if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    ) {
        return 'image/png';
    }

    if (
        buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
        return 'image/webp';
    }

    if (buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-') {
        return 'application/pdf';
    }

    if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
        const brand = buffer.toString('ascii', 8, 12);
        if (['heic', 'heix', 'hevc', 'hevx'].includes(brand)) return 'image/heic';
        if (['mif1', 'msf1', 'heif'].includes(brand)) return 'image/heif';
    }

    return null;
}
