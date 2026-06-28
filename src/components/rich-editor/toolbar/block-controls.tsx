import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { IconBraces, IconList, IconListNumbers, IconQuote } from '@tabler/icons-react';
import { ToolbarButton } from './toolbar-button.tsx';
import { m } from '@/paraglide/messages';

export function BlockControls() {
  const { editor } = useCurrentEditor();

  const { bulletList, orderedList, blockquote, codeBlock } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false,
      blockquote: currentEditor?.isActive('blockquote') ?? false,
      codeBlock: currentEditor?.isActive('codeBlock') ?? false,
    }),
  }) ?? { bulletList: false, orderedList: false, blockquote: false, codeBlock: false };

  const isDisabled = !editor || !editor.isEditable;

  return (
    <>
      <ToolbarButton
        label={m['components.rich_editor.bullet_list']()}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        active={bulletList}
        disabled={isDisabled}
        shortcut="Mod+Shift+8"
        icon={IconList}
      />
      <ToolbarButton
        label={m['components.rich_editor.ordered_list']()}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        active={orderedList}
        disabled={isDisabled}
        shortcut="Mod+Shift+7"
        icon={IconListNumbers}
      />
      <ToolbarButton
        label={m['components.rich_editor.blockquote']()}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        active={blockquote}
        disabled={isDisabled}
        shortcut="Mod+Shift+B"
        icon={IconQuote}
      />
      <ToolbarButton
        label={m['components.rich_editor.code_block']()}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        active={codeBlock}
        disabled={isDisabled}
        shortcut="Mod+Alt+C"
        icon={IconBraces}
      />
    </>
  );
}
