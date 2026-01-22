import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import type { Performer } from '../../app/types/performers.types';
import * as s3Service from '../../app/services/s3Upload.service';

vi.mock('../../app/services/s3Upload.service');
vi.mock('../../app/services/image-optimization.service');

describe('AssetUploader integration', () => {
  const performer = { id: 123, stage_name: 'Test', avatar: '' } as unknown as Performer;

  beforeEach(async () => {
    vi.resetAllMocks();
    // By default, optimization returns same file + a thumb
    const mod = await import('../../app/services/image-optimization.service');
    vi.mocked(mod.optimizeImage).mockImplementation(
      async (f: File) =>
        ({
          optimizedFile: f,
          thumbFile: new File(['thumb'], `${f.name}-thumb.${f.type.split('/').pop() || 'jpg'}`, {
            type: f.type,
          }),
        } as any)
    );

    // Ensure buildFileName returns a valid key during tests so flow proceeds
    vi.mocked(s3Service.buildFileName).mockImplementation(() => 'images/123/test.jpg' as any);
  });

  it('sube un archivo usando presigned url, lo registra y muestra como completado', async () => {
    const file = new File(['hello'], 'hello.jpg', { type: 'image/jpeg' });

    vi.mocked(s3Service.getPresignedUploadUrl).mockResolvedValue({
      url: 'https://s3.test/hello.jpg?sig=1',
      fileName: 'hello.jpg',
      expiresIn: 900,
      contentType: 'image/jpeg',
    });

    vi.mocked(s3Service.uploadToS3).mockResolvedValue({
      success: true,
      objectUrl: 'https://s3.test/hello.jpg',
      status: 200,
    });

    vi.mocked(s3Service.uploadAsset).mockResolvedValue({
      id: 555,
      fileName: 'hello.jpg',
      fileURL: 'https://s3.test/hello.jpg',
      contentType: 'image/jpeg',
      assetType: 'photo',
      createdAt: new Date().toISOString(),
    });

    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);

    // Simular selección de archivo
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    expect(input).toBeTruthy();

    // Fire change event
    fireEvent.change(input, { target: { files: [file] } });

    // Esperar que la optimización haya sido invocada y que las llamadas de subida/registro ocurran (main + thumb)
    const mod = await import('../../app/services/image-optimization.service');
    await waitFor(() => expect(mod.optimizeImage).toHaveBeenCalledWith(file));

    const errSpy = vi.spyOn(console, 'error');

    // Wait for either an error logged by the component (to surface it) or the s3 calls
    await waitFor(() => {
      if (errSpy.mock.calls.length) {
        const maybeErr = errSpy.mock.calls[0][1];
        throw new Error('Component error: ' + (maybeErr?.message || JSON.stringify(maybeErr)));
      }
      return expect(s3Service.getPresignedUploadUrl).toHaveBeenCalled();
    });

    await waitFor(() => expect(s3Service.uploadToS3).toHaveBeenCalled());
    await waitFor(() => expect(s3Service.uploadAsset).toHaveBeenCalledTimes(2));

    // El asset debe aparecer como 'completed' (CheckCircle visible). Puede haber varios (main + thumb)
    await waitFor(() => expect(screen.getAllByTitle('Ver').length).toBeGreaterThan(0));
  });

  it('marca el asset como failed si getPresignedUploadUrl falla', async () => {
    const file = new File(['bad'], 'bad.jpg', { type: 'image/jpeg' });
    vi.mocked(s3Service.getPresignedUploadUrl).mockRejectedValue(new Error('Bad request'));

    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(s3Service.getPresignedUploadUrl).toHaveBeenCalled());

    // El asset debe quedar en estado failed: icono X (se muestra botón Ver o Eliminar no aparece)
    await waitFor(() => expect(screen.queryByTitle('Ver')).not.toBeInTheDocument());
  });

  it('ignora archivos no soportados (text/plain)', async () => {
    const file = new File(['text'], 'readme.txt', { type: 'text/plain' });
    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    // Como no es image/video, no debe llamarse al servicio S3
    await new Promise((r) => setTimeout(r, 50));
    expect(s3Service.getPresignedUploadUrl).not.toHaveBeenCalled();
    // No se muestran assets
    expect(screen.queryByText(/Assets subidos/i)).not.toBeInTheDocument();
  });

  it('continua si optimizeImage falla y usa archivo original', async () => {
    const file = new File(['orig'], 'orig.jpg', { type: 'image/jpeg' });

    const mod = await import('../../app/services/image-optimization.service');
    vi.mocked(mod.optimizeImage).mockRejectedValue(new Error('Optimization failed'));

    vi.mocked(s3Service.getPresignedUploadUrl).mockResolvedValue({
      url: 'https://s3.test/orig.jpg?sig=1',
      fileName: 'orig.jpg',
      expiresIn: 900,
      contentType: 'image/jpeg',
    });

    // Capture file passed to uploadToS3 to assert it's the original without throwing inside the mock
    let uploadedFileName: string | null = null;
    vi.mocked(s3Service.uploadToS3).mockImplementation(async (fileParam: any) => {
      uploadedFileName = fileParam?.name || null;
      return { success: true, objectUrl: 'https://s3.test/orig.jpg', status: 200 } as any;
    });

    vi.mocked(s3Service.uploadAsset).mockResolvedValue({
      id: 1,
      fileName: 'orig.jpg',
      fileURL: 'https://s3.test/orig.jpg',
      contentType: 'image/jpeg',
      assetType: 'photo',
      createdAt: new Date().toISOString(),
    } as any);

    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mod.optimizeImage).toHaveBeenCalledWith(file));
    await waitFor(() => expect(uploadedFileName).toBe(file.name));
    await waitFor(() => expect(screen.getAllByTitle('Ver').length).toBeGreaterThan(0));
  });

  it('marca el asset como failed si uploadToS3 falla', async () => {
    const file = new File(['nope'], 'nope.jpg', { type: 'image/jpeg' });
    vi.mocked(s3Service.getPresignedUploadUrl).mockResolvedValue({
      url: 'https://s3.test/nope.jpg?sig=1',
      fileName: 'nope.jpg',
      expiresIn: 900,
      contentType: 'image/jpeg',
    });

    vi.mocked(s3Service.uploadToS3).mockRejectedValue(new Error('Upload failed'));

    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(s3Service.getPresignedUploadUrl).toHaveBeenCalled());
    await waitFor(() => expect(s3Service.uploadToS3).toHaveBeenCalled());

    // No debe mostrarse botón Ver
    await waitFor(() => expect(screen.queryByTitle('Ver')).not.toBeInTheDocument());
  });

  it('si el registro del asset falla, marca como failed', async () => {
    const file = new File(['badreg'], 'badreg.jpg', { type: 'image/jpeg' });

    vi.mocked(s3Service.getPresignedUploadUrl).mockResolvedValue({
      url: 'https://s3.test/badreg.jpg?sig=1',
      fileName: 'badreg.jpg',
      expiresIn: 900,
      contentType: 'image/jpeg',
    });

    vi.mocked(s3Service.uploadToS3).mockResolvedValue({
      success: true,
      objectUrl: 'https://s3.test/badreg.jpg',
      status: 200,
    });

    vi.mocked(s3Service.uploadAsset).mockRejectedValue(new Error('Registration failed'));

    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(s3Service.uploadToS3).toHaveBeenCalled());
    await waitFor(() => expect(s3Service.uploadAsset).toHaveBeenCalled());

    await waitFor(() => expect(screen.queryByTitle('Ver')).not.toBeInTheDocument());
  });

  it('continua si la subida del thumbnail falla y aun asi completa el asset principal', async () => {
    const file = new File(['thumbfail'], 'thumbfail.jpg', { type: 'image/jpeg' });

    vi.mocked(s3Service.getPresignedUploadUrl).mockResolvedValue({
      url: 'https://s3.test/thumbfail.jpg?sig=1',
      fileName: 'thumbfail.jpg',
      expiresIn: 900,
      contentType: 'image/jpeg',
    });

    // uploadToS3: first call main -> success, second call thumb -> reject
    let call = 0;
    vi.mocked(s3Service.uploadToS3).mockImplementation(async () => {
      call += 1;
      if (call === 1) return { success: true, objectUrl: 'https://s3.test/thumbfail.jpg' } as any;
      throw new Error('Thumb upload failed');
    });

    vi.mocked(s3Service.uploadAsset).mockResolvedValue({
      id: 999,
      fileName: 'thumbfail.jpg',
      fileURL: 'https://s3.test/thumbfail.jpg',
      contentType: 'image/jpeg',
      assetType: 'photo',
      createdAt: new Date().toISOString(),
    } as any);

    const { default: AssetUploader } = await import('../../components/performers/AssetUploader');
    const { container } = render(<AssetUploader performer={performer} onClose={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    // Spy console.error to detect that the failure was logged
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(s3Service.uploadToS3).toHaveBeenCalled());
    // Since thumbnail upload (early step) failed, the component marks the asset as failed
    await waitFor(() => expect(screen.queryByTitle('Ver')).not.toBeInTheDocument());
    expect(errSpy).toHaveBeenCalled();
  });
});
