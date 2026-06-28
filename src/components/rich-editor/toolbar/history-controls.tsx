import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { IconArrowBackUp, IconArrowForwardUp } from '@tabler/icons-react';
import { ToolbarButton } from './toolbar-button.tsx';
import { m } from '@/paraglide/messages';

export function HistoryControls() {
  const { editor } = useCurrentEditor();

  const { canUndo, canRedo } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canUndo: currentEditor?.can().chain().focus().undo().run() ?? false,
      canRedo: currentEditor?.can().chain().focus().redo().run() ?? false,
    }),
  }) ?? { canUndo: false, canRedo: false };

  const isDisabled = !editor || !editor.isEditable;

  return (
    <>
      <ToolbarButton
        label={m['components.rich_editor.undo']()}
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={isDisabled || !canUndo}
        shortcut="Mod+Z"
        icon={IconArrowBackUp}
      />
      <ToolbarButton
        label={m['components.rich_editor.redo']()}
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={isDisabled || !canRedo}
        shortcut="Mod+Shift+Z"
        icon={IconArrowForwardUp}
      />
    </>
  );
}
