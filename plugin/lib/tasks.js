import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const MIME = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.fbx': 'application/octet-stream',
  '.obj': 'text/plain; charset=utf-8',
  '.stl': 'model/stl',
  '.usdz': 'model/vnd.usdz+zip',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export function mimeFor(file) {
  return MIME[extname(file).toLowerCase()] || 'application/octet-stream';
}

function safeName(value) {
  return String(value || 'model').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 120);
}

export class TaskStore {
  constructor({ file, previewFile }) {
    this.file = file;
    this.previewFile = previewFile;
    this.tasks = new Map();
    this.previews = new Map();
    this.loaded = false;
    this.loadPromise = undefined;
  }

  load() {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = (async () => {
      try {
        const raw = JSON.parse(await readFile(this.file, 'utf8'));
        for (const task of raw.tasks || []) this.tasks.set(`${task.providerId}:${task.taskId}`, task);
        for (const preview of raw.previews || []) this.previews.set(preview.id, preview);
      } catch {
        /* first run */
      } finally {
        this.loaded = true;
      }
    })();
    return this.loadPromise;
  }

  async save() {
    const data = {
      version: 1,
      tasks: [...this.tasks.values()].slice(-200),
      previews: [...this.previews.values()].slice(-200),
    };
    await mkdir(join(this.file, '..'), { recursive: true });
    await writeFile(this.file, JSON.stringify(data, null, 2), 'utf8');
    await mkdir(join(this.previewFile, '..'), { recursive: true });
    await writeFile(this.previewFile, JSON.stringify(data, null, 2), 'utf8');
  }

  key(providerId, taskId) {
    return `${providerId}:${taskId}`;
  }

  get(providerId, taskId) {
    return this.tasks.get(this.key(providerId, taskId));
  }

  list() {
    return [...this.tasks.values()];
  }

  async put(task) {
    this.tasks.set(this.key(task.providerId, task.taskId), task);
    await this.save();
    return task;
  }

  async patch(providerId, taskId, patch) {
    const current = this.get(providerId, taskId);
    if (!current) return undefined;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.tasks.set(this.key(providerId, taskId), next);
    await this.save();
    return next;
  }

  async registerPreview(file, meta = {}) {
    const id = createHash('sha256').update(`${file}:${randomUUID()}`).digest('hex').slice(0, 24);
    const preview = { id, file, createdAt: new Date().toISOString(), ...meta };
    this.previews.set(id, preview);
    await this.save();
    return preview;
  }

  async registerPreviewFromFile(file, meta = {}) {
    return this.registerPreview(file, meta);
  }

  resolvePreview(id) {
    return this.previews.get(id);
  }

  async download(url, outputDir, { providerId, taskId, extensionHint } = {}) {
    if (!url) throw new Error('没有可下载的模型 URL');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`下载模型失败：HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    let name = 'model.glb';
    try {
      const candidate = basename(new URL(url).pathname);
      if (candidate && candidate !== '/') name = candidate;
    } catch {
      /* keep default */
    }
    if (!extname(name)) name += extensionHint || '.glb';
    const file = join(outputDir, `${safeName(providerId)}-${safeName(taskId)}-${safeName(name)}`);
    await mkdir(outputDir, { recursive: true });
    await writeFile(file, buffer);
    return { file, bytes: buffer.byteLength, mediaType: mimeFor(file) };
  }
}
