import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { IconAlignCenter, IconAlignJustified, IconAlignLeft, IconAlignRight } from '@tabler/icons-react';
import { ToolbarButton } from './toolbar-button.tsx';
import { m } from '@/paraglide/messages';

type TextAlignType = 'left' | 'center' | 'right' | 'justify';

function getTextAlign(editor: { isActive: (attrs: Record<string, unknown>) => boolean }): TextAlignType {
  if (editor.isActive({ textAlign: 'justify' })) return 'justify';
  if (editor.isActive({ textAlign: 'right' })) return 'right';
  if (editor.isActive({ textAlign: 'center' })) return 'center';
  return 'left';
}

export function AlignControls() {
  const { editor } = useCurrentEditor();

  const activeAlign = useEditorState<TextAlignType>({
    editor,
    selector: ({ editor: currentEditor }) => (currentEditor ? getTextAlign(currentEditor) : 'left'),
  }) ?? 'left';

  const isDisabled = !editor || !editor.isEditable;

  return (
    <>
      <ToolbarButton
        label={m['components.rich_editor.align_left']()}
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        active={activeAlign === 'left'}
        disabled={isDisabled}
        icon={IconAlignLeft}
      />
      <ToolbarButton
        label={m['components.rich_editor.align_center']()}
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        active={activeAlign === 'center'}
        disabled={isDisabled}
        icon={IconAlignCenter}
      />
      <ToolbarButton
        label={m['components.rich_editor.align_right']()}
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        active={activeAlign === 'right'}
        disabled={isDisabled}
        icon={IconAlignRight}
      />
      <ToolbarButton
        label={m['components.rich_editor.justify']()}
        onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
        active={activeAlign === 'justify'}
        disabled={isDisabled}
        icon={IconAlignJustified}
      />
    </>
  );
}
