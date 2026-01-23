// extractVideoFrame utility removed. Thumbnails for videos should be generated server-side or provided by the API.
export const extractVideoFrame = async () => {
  throw new Error(
    'extractVideoFrame removed: not implemented. Generate thumbnails server-side or provide fileURLThumb from API.'
  );
};
