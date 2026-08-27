import React from 'react';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, SquareCode, Table, Link as LinkIcon, 
  Image as ImageIcon, Undo, Redo, Minus
} from 'lucide-react';

export default function TiptapToolbar({ editor, onInsertImage }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL link address:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="bg-[#0e0e0e] border-b border-moto-border p-2 flex flex-wrap items-center gap-1 text-gray-300 select-none">
      
      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-moto-panel text-gray-400 hover:text-white disabled:opacity-30"
        title="Undo (Ctrl+Z)"
      >
        <Undo size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-moto-panel text-gray-400 hover:text-white disabled:opacity-30"
        title="Redo (Ctrl+Y)"
      >
        <Redo size={15} />
      </button>

      <div className="h-4 w-px bg-moto-border mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Heading 1"
      >
        <Heading1 size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Heading 2"
      >
        <Heading2 size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Heading 3"
      >
        <Heading3 size={15} />
      </button>

      <div className="h-4 w-px bg-moto-border mx-1" />

      {/* Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Strikethrough"
      >
        <Strikethrough size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('code') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Inline Code"
      >
        <Code size={15} />
      </button>

      <div className="h-4 w-px bg-moto-border mx-1" />

      {/* Lists & Quotes */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Bullet List"
      >
        <List size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Numbered List"
      >
        <ListOrdered size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Blockquote"
      >
        <Quote size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Code Block"
      >
        <SquareCode size={15} />
      </button>

      <div className="h-4 w-px bg-moto-border mx-1" />

      {/* Elements */}
      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Add Link"
      >
        <LinkIcon size={15} />
      </button>
      <button
        type="button"
        onClick={onInsertImage}
        className="p-1.5 rounded hover:bg-moto-panel hover:text-white transition-colors"
        title="Upload / Insert Image"
      >
        <ImageIcon size={15} />
      </button>
      <button
        type="button"
        onClick={insertTable}
        className={`p-1.5 rounded transition-colors ${editor.isActive('table') ? 'bg-moto-orange text-white' : 'hover:bg-moto-panel hover:text-white'}`}
        title="Insert 3x3 Table"
      >
        <Table size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded hover:bg-moto-panel hover:text-white transition-colors"
        title="Horizontal Divider"
      >
        <Minus size={15} />
      </button>

    </div>
  );
}
