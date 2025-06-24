declare module 'dom-to-image-more' {
  interface DomToImage {
    toPng: (node: HTMLElement, options?: Record<string, unknown>) => Promise<string>;
    toSvg: (node: HTMLElement, options?: Record<string, unknown>) => Promise<string>;
    toJpeg: (node: HTMLElement, options?: Record<string, unknown>) => Promise<string>;
    toBlob: (node: HTMLElement, options?: Record<string, unknown>) => Promise<Blob>;
  }

  const domToImage: DomToImage;
  export default domToImage;
}
