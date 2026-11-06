'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Node } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from 'react-icons/md';

// Conserva <div class="..."> en el modo visual (si no, TipTap descarta el div y su clase)
const ClassDiv = Node.create({
  name: 'classDiv',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return { class: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'div[class]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Bloques seleccionables en modo HTML: { 'block-a': 'Bloque A' } (clave = clase CSS) */
  blocks?: Record<string, string>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe algo...',
  minHeight = '200px',
  blocks,
}) => {
  const [htmlMode, setHtmlMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      ClassDiv,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // En modo HTML la textarea es la fuente; al volver al visual se sincroniza una vez
  useEffect(() => {
    if (editor && !htmlMode && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor, htmlMode]);

  if (!editor) {
    return null;
  }

  const buttonClass = 'px-2 py-1 mx-1 rounded border border-surface-300 bg-white hover:bg-surface-50 text-sm font-medium transition cursor-pointer';
  const activeButtonClass = 'px-2 py-1 mx-1 rounded border border-surface-300 bg-primary-500 text-white text-sm font-medium transition cursor-pointer';

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  // Envuelve el texto seleccionado en la textarea HTML con <div class="...">
  const wrapSelection = (cls: string) => {
    if (!htmlMode) {
      // Modo visual: envuelve el/los bloque(s) de la selección en un classDiv
      editor.chain().focus().wrapIn('classDiv', { class: cls }).run();
      return;
    }
    const ta = textareaRef.current;
    if (!ta || ta.selectionStart === ta.selectionEnd) return;
    const { selectionStart: start, selectionEnd: end, value: text } = ta;
    const open = `<div class="${cls}">`;
    onChange(text.slice(0, start) + open + text.slice(start, end) + '</div>' + text.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, end + open.length + '</div>'.length);
    });
  };

  return (
    <div className="border border-surface-300 rounded-md overflow-hidden bg-white">
      {/* Cambio de modo visual / HTML */}
      <div className="bg-surface-50 border-b border-surface-300 px-3 py-2 flex justify-end">
        <button
          type="button"
          onClick={() => setHtmlMode((m) => !m)}
          className={buttonClass}
          title={htmlMode ? 'Volver al editor visual' : 'Ver y editar el HTML puro'}
        >
          {htmlMode ? 'Editor visual' : '</> Ver HTML'}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-50 border-b border-surface-300 p-3 flex flex-wrap gap-1 items-center">
      <div className={htmlMode ? 'hidden' : 'contents'}>
        {/* Encabezados */}
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
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
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
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

        {/* Alineación */}
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign(align).run())}
              className={editor.isActive({ textAlign: align }) ? activeButtonClass : buttonClass}
              title={{ left: 'Alinear a la izquierda', center: 'Centrar', right: 'Alinear a la derecha' }[align]}
            >
              {{ left: <MdFormatAlignLeft />, center: <MdFormatAlignCenter />, right: <MdFormatAlignRight /> }[align]}
            </button>
          ))}
        </div>

        {/* Color de texto */}
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
          <input
            type="color"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().setColor(e.target.value).run();
            }}
            className="w-8 h-8 cursor-pointer rounded border border-surface-300"
            title="Color de texto"
            defaultValue="#000000"
          />
          <span className="text-xs text-surface-600">Color</span>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
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
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
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
        <div className="flex items-center gap-1 border-r border-surface-200 pr-2">
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

      {/* Bloques HTML (en modo visual y HTML) */}
      {blocks && Object.keys(blocks).length > 0 && (
        <div className="flex items-center gap-1 border-l border-surface-200 pl-2 flex-wrap">
          <span className="text-xs text-surface-600 mr-1">Envolver en:</span>
          {Object.entries(blocks).map(([cls, label]) => (
            <button
              key={cls}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrapSelection(cls)}
              className={buttonClass}
              title={`<div class="${cls}">`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      </div>

      {htmlMode && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full font-mono text-sm p-3 border-0 focus:outline-none"
          style={{ minHeight }}
        />
      )}

      {/* Editor */}
      <div className={htmlMode ? 'hidden' : ''}>
      <div
        className="prose prose-sm max-w-none p-3 focus:outline-none"
        style={{ minHeight }}
      >
        <EditorContent
          editor={editor}
          className="editor-content prose prose-sm max-w-none focus:outline-none"
        />
      </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
