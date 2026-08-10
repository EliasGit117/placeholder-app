// Plain-text excerpt from RichEditor (Tiptap) HTML — used where markup can't be rendered (card previews, meta descriptions).
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
