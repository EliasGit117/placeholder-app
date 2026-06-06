import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { IconArrowBackUp, IconArrowForwardUp } from '@tabler/icons-react';
import { ToolbarButton } from './toolbar-button.tsx';

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
        label="Undo"
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={isDisabled || !canUndo}
        shortcut="Mod+Z"
        icon={IconArrowBackUp}
      />
      <ToolbarButton
        label="Redo"
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={isDisabled || !canRedo}
        shortcut="Mod+Shift+Z"
        icon={IconArrowForwardUp}
      />
    </>
  );
}
