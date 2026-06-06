import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { IconBold, IconCode, IconItalic, IconLink, IconStrikethrough } from '@tabler/icons-react';
import { ToolbarButton } from './toolbar-button.tsx';

function setOrUnsetLink(editor: NonNullable<ReturnType<typeof useCurrentEditor>['editor']>) {
  const previousUrl = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('Enter URL', previousUrl ?? '');

  if (url === null) return;

  if (url.trim() === '') {
    editor.chain().focus().unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

export function MarkControls() {
  const { editor } = useCurrentEditor();

  const { bold, italic, code, strike, link } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      code: currentEditor?.isActive('code') ?? false,
      strike: currentEditor?.isActive('strike') ?? false,
      link: currentEditor?.isActive('link') ?? false,
    }),
  }) ?? { bold: false, italic: false, code: false, strike: false, link: false };

  const isDisabled = !editor || !editor.isEditable;

  return (
    <>
      <ToolbarButton
        label="Bold"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        active={bold}
        disabled={isDisabled}
        shortcut="Mod+B"
        icon={IconBold}
      />
      <ToolbarButton
        label="Italic"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        active={italic}
        disabled={isDisabled}
        shortcut="Mod+I"
        icon={IconItalic}
      />
      <ToolbarButton
        label="Code"
        onClick={() => editor?.chain().focus().toggleCode().run()}
        active={code}
        disabled={isDisabled}
        shortcut="Mod+E"
        icon={IconCode}
      />
      <ToolbarButton
        label="Strike"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        active={strike}
        disabled={isDisabled}
        shortcut="Mod+Shift+X"
        icon={IconStrikethrough}
      />
      <ToolbarButton
        label="Link"
        onClick={() => editor && setOrUnsetLink(editor)}
        active={link}
        disabled={isDisabled}
        shortcut="Mod+K"
        icon={IconLink}
      />
    </>
  );
}
