import { optimizeImage } from '../../app/services/image-optimization.service';

// Mock pica to avoid heavy browser processing in tests
vi.mock('pica', () => ({
  default: () => ({
    resize: vi.fn(async (_src: any, dest: HTMLCanvasElement) => {
      // Avoid using getContext in tests (jsdom doesn't implement it by default)
      // Ensure canvas has dimensions and resolve
      dest.width = dest.width || 1;
      dest.height = dest.height || 1;
      return Promise.resolve();
    }),
  }),
}));

describe('optimizeImage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Fallback: simulate createImageBitmap
    (global as any).createImageBitmap = async (_file: File) =>
      ({ width: 4000, height: 3000 } as any);

    // Mock canvas.toBlob used by the service
    HTMLCanvasElement.prototype.toBlob = function (cb: any, type?: any, _quality?: any) {
      const blob = new Blob(['x'], { type: type || 'image/jpeg' });
      cb(blob);
    };
  });

  it('genera un archivo optimizado y un thumb', async () => {
    const file = new File(['fake-image-content'], 'big.jpg', { type: 'image/jpeg' });

    const res = await optimizeImage(file, {
      maxWidth: 1024,
      maxHeight: 768,
      maxSizeKB: 300,
      thumbWidth: 320,
      thumbHeight: 240,
      thumbMaxSizeKB: 50,
      outputFormat: 'jpeg',
      quality: 0.8,
    } as any);

    expect(res.optimizedFile).toBeInstanceOf(File);
    expect(res.thumbFile).toBeInstanceOf(File);
    expect(res.optimizedFile.name).toContain('-optimized');
    expect(res.thumbFile.name).toContain('-thumb');
    expect(res.optimizedFile.size).toBeGreaterThan(0);
  });
});
