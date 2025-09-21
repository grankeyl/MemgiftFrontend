// src/polyfills-node.ts
import { Buffer } from 'buffer';
import process from 'process';

// Глобалы для браузера
// @ts-error
if (!globalThis.Buffer) globalThis.Buffer = Buffer;
// @ts-error
if (!globalThis.process) globalThis.process = process as any;