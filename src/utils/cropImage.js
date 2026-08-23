export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * getCroppedImg
 * Supports zoom-out (zoom < 1) by compositing the image centered on a
 * canvas filled with `bgColor`, then cropping the requested region.
 *
 * @param {string}  imageSrc         - object URL or data URL of source image
 * @param {object}  pixelCrop        - { x, y, width, height } from react-easy-crop
 * @param {string}  bgColor          - CSS color for the padding area ('white' | 'black' | any)
 * @param {{ horizontal: boolean, vertical: boolean }} flip
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  bgColor = 'white',
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // The "natural" canvas is the image size — but when zoom < 1, react-easy-crop
  // reports pixel coordinates outside the image bounds (the padded region).
  // We need a larger canvas that represents the full crop area including padding.
  //
  // react-easy-crop gives coordinates in the "media coordinate space":
  // when zoom < 1 the crop box can extend beyond the image edges, so pixelCrop
  // values may be negative or exceed image dimensions.
  //
  // Strategy:
  //  1. Create a canvas exactly the size of pixelCrop (the final output size).
  //  2. Fill it with bgColor.
  //  3. Figure out where the image sits inside that canvas and draw it there.

  const outputW = pixelCrop.width;
  const outputH = pixelCrop.height;

  canvas.width = outputW;
  canvas.height = outputH;

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, outputW, outputH);

  // Apply flip transforms around center
  ctx.save();
  ctx.translate(outputW / 2, outputH / 2);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-outputW / 2, -outputH / 2);

  // Where does the image sit relative to the crop region?
  // The image starts at (-pixelCrop.x, -pixelCrop.y) in output canvas coords.
  const imgX = -pixelCrop.x;
  const imgY = -pixelCrop.y;

  ctx.drawImage(image, imgX, imgY, image.width, image.height);
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
  });
}
