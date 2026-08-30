import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import TiptapToolbar from './TiptapToolbar';
import MediaSelectModal from '../common/MediaSelectModal';
import { uploadMediaAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Bold, Italic, Heading2, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

// Custom Extended Image Extension with align and width support
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => {
          const w = attributes.width || '100%';
          return {
            style: `width: ${w}; max-width: 100%; height: auto;`,
          };
        },
        parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
      },
      align: {
        default: 'center',
        renderHTML: attributes => {
          const align = attributes.align || 'center';
          let marginStyle = 'margin-left: auto; margin-right: auto; display: block;';
          if (align === 'left') {
            marginStyle = 'margin-left: 0; margin-right: auto; display: block;';
          } else if (align === 'right') {
            marginStyle = 'margin-left: auto; margin-right: 0; display: block;';
          }
          return {
            'data-align': align,
            style: marginStyle,
          };
        },
        parseHTML: element => element.getAttribute('data-align') || 'center',
      },
    };
  },
});

export default function TiptapEditor({ markdown = '', onChange }) {
  const { showToast } = useApp();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false,
        autolink: true
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write your story in raw markdown or rich visual layout... Drag & drop images here or type "/" for quick blocks.'
      }),
      Markdown.configure({
        html: true,
        transformCopiedText: true,
        transformPastedText: true
      })
    ],
    content: markdown,
    onUpdate: ({ editor }) => {
      // Export current editor state as clean Markdown
      let md = editor.storage.markdown.getMarkdown();
      if (md) {
        md = md.replace(/([^\n])\n*(#{1,6}\s+)/g, '$1\n\n$2');
      }
      if (onChange) onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[360px] p-5 focus:outline-none font-sans text-sm leading-relaxed'
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUploadFile(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData && event.clipboardData.items;
        if (items) {
          for (let item of items) {
            if (item.type.indexOf('image') === 0) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                handleImageUploadFile(file);
                return true;
              }
            }
          }
        }
        return false;
      }
    }
  });

  // Keep editor content in sync when markdown prop changes externally
  useEffect(() => {
    if (editor && markdown !== undefined) {
      const currentMd = editor.storage.markdown.getMarkdown();
      if (currentMd !== markdown) {
        editor.commands.setContent(markdown);
      }
    }
  }, [markdown, editor]);

  const handleImageUploadFile = async (file) => {
    if (!editor) return;
    setIsUploading(true);
    showToast('Uploading image to cloud storage...', 'info');

    try {
      const record = await uploadMediaAdmin(file);
      const imageUrl = record.public_url;
      
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
      showToast('Image inserted into story!', 'success');
    } catch (err) {
      showToast('Failed to upload image', 'error');
    }
    setIsUploading(false);
  };

  const triggerImageUploadPrompt = () => {
    setIsMediaModalOpen(true);
  };

  const handleSelectMediaImage = (imageUrl, record) => {
    if (!editor) return;
    const altText = record?.alt_text || record?.title || record?.original_filename || 'Article image';
    editor.chain().focus().setImage({ src: imageUrl, alt: altText }).run();
    showToast('Image inserted into article body!', 'success');
  };

  return (
    <div className="bg-moto-card border border-moto-border rounded-xl overflow-hidden shadow-2xl relative">
      
      {/* Media Selection Modal */}
      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleSelectMediaImage}
        title="Select Media Image for Article Body"
      />

      {/* Editor Fixed Toolbar */}
      <TiptapToolbar editor={editor} onInsertImage={triggerImageUploadPrompt} />

      {/* Contextual Floating Controls on Image Selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => editor.isActive('image')}
          tippyOptions={{ duration: 150, placement: 'top' }}
          className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl shadow-2xl p-1.5 flex items-center gap-2 select-none z-30"
        >
          {/* ALIGN Group */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-1">
              ALIGN
            </span>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()}
              className={`p-1.5 rounded transition-colors ${
                (editor.getAttributes('image').align === 'left')
                  ? 'bg-moto-orange text-white font-bold shadow-glow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-moto-panel'
              }`}
              title="Align Left"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()}
              className={`p-1.5 rounded transition-colors ${
                (editor.getAttributes('image').align === 'center' || !editor.getAttributes('image').align)
                  ? 'bg-moto-orange text-white font-bold shadow-glow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-moto-panel'
              }`}
              title="Align Center"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()}
              className={`p-1.5 rounded transition-colors ${
                (editor.getAttributes('image').align === 'right')
                  ? 'bg-moto-orange text-white font-bold shadow-glow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-moto-panel'
              }`}
              title="Align Right"
            >
              <AlignRight size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-moto-border" />

          {/* SIZE Group */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-1">
              SIZE
            </span>
            {['25%', '50%', '75%', '100%'].map((sizeVal) => {
              const isCurrentSize = (editor.getAttributes('image').width || '100%') === sizeVal;
              return (
                <button
                  key={sizeVal}
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: sizeVal }).run()}
                  className={`px-2 py-1 rounded font-bold transition-colors ${
                    isCurrentSize
                      ? 'bg-moto-orange text-white shadow-glow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-moto-panel'
                  }`}
                >
                  {sizeVal}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-moto-border" />

          {/* DELETE Button */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
            title="Delete Image"
          >
            <Trash2 size={15} />
          </button>
        </BubbleMenu>
      )}

      {/* Contextual Bubble Menu on Text Selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state }) => !editor.isActive('image') && !state.selection.empty}
          tippyOptions={{ duration: 100 }}
          className="bg-[#141414] border border-moto-orange/50 rounded-lg shadow-2xl p-1 flex items-center gap-1"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs ${editor.isActive('bold') ? 'bg-moto-orange text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs ${editor.isActive('italic') ? 'bg-moto-orange text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-moto-orange text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <Heading2 size={13} />
          </button>
        </BubbleMenu>
      )}

      {/* Loading Overlay when Uploading Image directly */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center text-xs font-bold text-moto-orange gap-2">
          <div className="w-5 h-5 border-2 border-moto-orange border-t-transparent rounded-full animate-spin" />
          <span>Uploading image asset...</span>
        </div>
      )}

      {/* ProseMirror Editor Container */}
      <EditorContent editor={editor} className="min-h-[380px] bg-moto-panel" />

      {/* Status Footer */}
      <div className="bg-[#0b0b0b] border-t border-moto-border px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>WYSIWYG Tiptap Editor • Storage Format: Clean Markdown</span>
        </div>
        <div>
          <span>Drag & Drop images enabled</span>
        </div>
      </div>

    </div>
  );
}
