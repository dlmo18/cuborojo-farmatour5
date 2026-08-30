'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe algo...',
  minHeight = '200px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const buttonClass = 'px-2 py-1 mx-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-sm font-medium transition cursor-pointer';
  const activeButtonClass = 'px-2 py-1 mx-1 rounded border border-gray-300 bg-primary-500 text-white text-sm font-medium transition cursor-pointer';

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-1 items-center">
        {/* Encabezados */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
            className={editor.isActive('heading', { level: 1 }) ? activeButtonClass : buttonClass}
            title="Encabezado 1"
          >
            H1
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
            className={editor.isActive('heading', { level: 2 }) ? activeButtonClass : buttonClass}
            title="Encabezado 2"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
            className={editor.isActive('heading', { level: 3 }) ? activeButtonClass : buttonClass}
            title="Encabezado 3"
          >
            H3
          </button>
        </div>

        {/* Estilos de texto */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
            className={editor.isActive('bold') ? activeButtonClass : buttonClass}
            title="Negrita (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
            className={editor.isActive('italic') ? activeButtonClass : buttonClass}
            title="Cursiva (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleStrike().run())}
            className={editor.isActive('strike') ? activeButtonClass : buttonClass}
            title="Tachado"
          >
            <s>S</s>
          </button>
        </div>

        {/* Color de texto */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <input
            type="color"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().setColor(e.target.value).run();
            }}
            className="w-8 h-8 cursor-pointer rounded border border-gray-300"
            title="Color de texto"
            defaultValue="#000000"
          />
          <span className="text-xs text-gray-600">Color</span>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
            className={editor.isActive('bulletList') ? activeButtonClass : buttonClass}
            title="Lista punteada"
          >
            •
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleOrderedList().run())}
            className={editor.isActive('orderedList') ? activeButtonClass : buttonClass}
            title="Lista numerada"
          >
            1.
          </button>
        </div>

        {/* Bloques */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleCodeBlock().run())}
            className={editor.isActive('codeBlock') ? activeButtonClass : buttonClass}
            title="Bloque de código"
          >
            {'<>'}
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBlockquote().run())}
            className={editor.isActive('blockquote') ? activeButtonClass : buttonClass}
            title="Cita"
          >
            "
          </button>
        </div>

        {/* Alineación */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().clearNodes().run())}
            className={buttonClass}
            title="Limpiar formato"
          >
            ⟲
          </button>
        </div>

        {/* Deshacer/Rehacer */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().undo().run())}
            className={buttonClass}
            disabled={!editor.can().undo()}
            title="Deshacer"
          >
            ↶
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().redo().run())}
            className={buttonClass}
            disabled={!editor.can().redo()}
            title="Rehacer"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        className="prose prose-sm max-w-none p-3 focus:outline-none"
        style={{ minHeight }}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
