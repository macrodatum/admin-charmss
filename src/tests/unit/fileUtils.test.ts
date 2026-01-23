import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  generateAssetId,
  isImageFile,
  isVideoFile,
  isValidFileType,
  createPreviewUrl,
} from '../../shared/utils/fileUtils';

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    it('debería formatear 0 bytes correctamente', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('debería formatear bytes correctamente', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('debería formatear kilobytes correctamente', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('debería formatear megabytes correctamente', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('debería formatear gigabytes correctamente', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('generateAssetId', () => {
    it('debería generar un ID único', () => {
      const id1 = generateAssetId();
      const id2 = generateAssetId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('debería generar un ID alfanumérico', () => {
      const id = generateAssetId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('isImageFile', () => {
    it('debería retornar true para archivos de imagen', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isImageFile(imageFile)).toBe(true);
    });

    it('debería retornar true para PNG', () => {
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      expect(isImageFile(pngFile)).toBe(true);
    });

    it('debería retornar false para archivos de video', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      expect(isImageFile(videoFile)).toBe(false);
    });

    it('debería retornar false para otros tipos de archivos', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isImageFile(textFile)).toBe(false);
    });
  });

  describe('isVideoFile', () => {
    it('debería retornar true para archivos de video MP4', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      expect(isVideoFile(videoFile)).toBe(true);
    });

    it('debería retornar true para archivos MOV', () => {
      const movFile = new File([''], 'test.mov', { type: 'video/quicktime' });
      expect(isVideoFile(movFile)).toBe(true);
    });

    it('debería retornar false para archivos de imagen', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isVideoFile(imageFile)).toBe(false);
    });

    it('debería retornar false para otros tipos de archivos', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isVideoFile(textFile)).toBe(false);
    });
  });

  describe('isValidFileType', () => {
    it('debería retornar true para imágenes', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isValidFileType(imageFile)).toBe(true);
    });

    it('debería retornar true para videos', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      expect(isValidFileType(videoFile)).toBe(true);
    });

    it('debería retornar false para archivos no válidos', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isValidFileType(textFile)).toBe(false);
    });

    it('debería retornar false para archivos PDF', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(isValidFileType(pdfFile)).toBe(false);
    });
  });

  describe('createPreviewUrl', () => {
    it('debería crear una URL de objeto válida', () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const url = createPreviewUrl(file);

      expect(url).toBeTruthy();
      expect(url).toMatch(/^blob:/);
    });

    it('debería crear URLs diferentes para archivos diferentes', () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });

      const url1 = createPreviewUrl(file1);
      const url2 = createPreviewUrl(file2);

      expect(url1).not.toBe(url2);
    });
  });
});
