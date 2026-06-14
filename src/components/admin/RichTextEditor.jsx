import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, Pilcrow,
  List, ListOrdered, Quote, Code, Link2, Unlink, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Eraser, Undo2, Redo2, Loader
} from 'lucide-react'
import { mediaApi } from '../../services/adminApi'
import { showToast } from './Toast'

// Scoped styles for the editable surface — Tailwind's reset strips heading/list
// styling, so we restore it here (and these match how the public ArticleDetail
// renders the same HTML).
const EDITOR_STYLES = `
.rte-content { outline: none; }
.rte-content:empty:before { content: attr(data-placeholder); color: #6b7280; pointer-events: none; }
.rte-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1.2rem 0 0.6rem; line-height: 1.25; }
.rte-content h3 { font-size: 1.2rem; font-weight: 700; margin: 1rem 0 0.5rem; line-height: 1.3; }
.rte-content p { margin: 0 0 0.85rem; line-height: 1.7; }
.rte-content ul { list-style: disc; padding-left: 1.5rem; margin: 0 0 0.85rem; }
.rte-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0 0 0.85rem; }
.rte-content li { margin: 0.25rem 0; line-height: 1.6; }
.rte-content a { color: #a855f7; text-decoration: underline; }
.rte-content blockquote { border-left: 3px solid #a855f7; padding: 0.4rem 0 0.4rem 1rem; margin: 0 0 0.85rem; color: #9ca3af; font-style: italic; }
.rte-content pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.85rem 1rem; overflow-x: auto; font-family: monospace; font-size: 0.85rem; margin: 0 0 0.85rem; }
.rte-content img { max-width: 100%; height: auto; border-radius: 10px; margin: 1rem 0; display: block; }
.rte-content:focus { outline: none; }
`

const Divider = () => <span className="w-px h-6 bg-white/10 mx-0.5 shrink-0" />

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing your story…', bare = false }) => {
  const ref = useRef(null)
  const savedRange = useRef(null)
  const isInternal = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [linkBar, setLinkBar] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Sync external value changes (e.g. async load in edit mode) without clobbering
  // the caret while the user types.
  useEffect(() => {
    if (!ref.current) return
    if (isInternal.current) { isInternal.current = false; return }
    if ((value || '') !== ref.current.innerHTML) ref.current.innerHTML = value || ''
  }, [value])

  const emit = useCallback(() => {
    if (!ref.current) return
    isInternal.current = true
    onChange(ref.current.innerHTML)
  }, [onChange])

  const saveSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0)
    }
  }, [])

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection()
    if (savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current) }
  }, [])

  // Keep selection on toolbar mousedown so commands apply to the current text.
  const onToolMouseDown = (e) => { e.preventDefault(); saveSelection() }

  const exec = (command, val = null) => {
    ref.current?.focus()
    restoreSelection()
    document.execCommand(command, false, val)
    emit()
    saveSelection()
  }

  const block = (tag) => exec('formatBlock', tag)

  const insertHTML = (html) => {
    ref.current?.focus()
    restoreSelection()
    document.execCommand('insertHTML', false, html)
    emit()
  }

  // ── Link ──
  const openLinkBar = () => { saveSelection(); setLinkUrl(''); setLinkBar(true) }
  const applyLink = () => {
    const url = linkUrl.trim()
    setLinkBar(false)
    if (!url) return
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    exec('createLink', href)
  }

  // ── Image upload (hosted via Media API) ──
  const onPickImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const res = await mediaApi.upload(file)
      const url = res?.url || res?.data?.url || res?.media?.url
      if (url) insertHTML(`<img src="${url}" alt="${file.name.replace(/"/g, '')}" />`)
      else showToast.error('Upload failed', 'No URL returned for the image')
    } catch {
      showToast.error('Upload failed', 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  const Btn = ({ onClick, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={onToolMouseDown}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 transition-all shrink-0 data-[theme=light]:text-gray-600 data-[theme=light]:hover:text-purple-600"
    >
      {children}
    </button>
  )

  return (
    <div className={bare
      ? 'bg-transparent'
      : 'border border-white/10 rounded-xl overflow-hidden bg-black/30 data-[theme=light]:bg-white data-[theme=light]:border-black/20'}>
      <style>{EDITOR_STYLES}</style>

      {/* Toolbar */}
      <div className={`flex items-center gap-0.5 flex-wrap p-2 border-b border-white/10 data-[theme=light]:border-black/10 sticky top-0 z-10 ${bare ? 'bg-[#0e0e16]/95 backdrop-blur-md data-[theme=light]:bg-white/95' : 'bg-white/5 data-[theme=light]:bg-black/5'}`}>
        <Btn title="Undo" onClick={() => exec('undo')}><Undo2 size={16} /></Btn>
        <Btn title="Redo" onClick={() => exec('redo')}><Redo2 size={16} /></Btn>
        <Divider />
        <Btn title="Paragraph" onClick={() => block('P')}><Pilcrow size={16} /></Btn>
        <Btn title="Heading" onClick={() => block('H2')}><Heading2 size={16} /></Btn>
        <Btn title="Subheading" onClick={() => block('H3')}><Heading3 size={16} /></Btn>
        <Divider />
        <Btn title="Bold" onClick={() => exec('bold')}><Bold size={16} /></Btn>
        <Btn title="Italic" onClick={() => exec('italic')}><Italic size={16} /></Btn>
        <Btn title="Underline" onClick={() => exec('underline')}><Underline size={16} /></Btn>
        <Btn title="Strikethrough" onClick={() => exec('strikeThrough')}><Strikethrough size={16} /></Btn>
        <Divider />
        <Btn title="Bulleted list" onClick={() => exec('insertUnorderedList')}><List size={16} /></Btn>
        <Btn title="Numbered list" onClick={() => exec('insertOrderedList')}><ListOrdered size={16} /></Btn>
        <Btn title="Quote" onClick={() => block('BLOCKQUOTE')}><Quote size={16} /></Btn>
        <Btn title="Code block" onClick={() => block('PRE')}><Code size={16} /></Btn>
        <Divider />
        <Btn title="Align left" onClick={() => exec('justifyLeft')}><AlignLeft size={16} /></Btn>
        <Btn title="Align center" onClick={() => exec('justifyCenter')}><AlignCenter size={16} /></Btn>
        <Btn title="Align right" onClick={() => exec('justifyRight')}><AlignRight size={16} /></Btn>
        <Divider />
        <Btn title="Add link" onClick={openLinkBar}><Link2 size={16} /></Btn>
        <Btn title="Remove link" onClick={() => exec('unlink')}><Unlink size={16} /></Btn>

        {/* Image upload — a label so the file dialog opens; selection is saved on mousedown */}
        <label
          title="Insert image"
          onMouseDown={saveSelection}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 transition-all shrink-0 cursor-pointer data-[theme=light]:text-gray-600"
        >
          {uploading ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <input type="file" accept="image/*" hidden onChange={onPickImage} disabled={uploading} />
        </label>

        <Divider />
        <Btn title="Clear formatting" onClick={() => exec('removeFormat')}><Eraser size={16} /></Btn>
      </div>

      {/* Link input bar */}
      {linkBar && (
        <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-purple-500/5 data-[theme=light]:border-black/10">
          <Link2 size={15} className="text-purple-400 shrink-0" />
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setLinkBar(false) }}
            placeholder="https://example.com — highlight text first, then add the link"
            className="flex-1 bg-black/30 border border-white/10 rounded-lg py-1.5 px-3 text-white text-[0.85rem] outline-none focus:border-purple-500 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20"
          />
          <button type="button" onClick={applyLink} className="py-1.5 px-3 bg-purple-500 text-white text-[0.8rem] font-semibold rounded-lg hover:bg-purple-600 transition-all">Add</button>
          <button type="button" onClick={() => setLinkBar(false)} className="py-1.5 px-2 text-gray-400 text-[0.8rem] hover:text-white transition-all">Cancel</button>
        </div>
      )}

      {/* Editable surface */}
      <div
        ref={ref}
        className={`rte-content text-gray-100 leading-relaxed data-[theme=light]:text-gray-900 ${bare ? 'py-6 min-h-[60vh] text-[1.12rem]' : 'p-5 min-h-[360px] max-h-[640px] overflow-y-auto text-[1rem]'}`}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={() => { saveSelection(); emit() }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  )
}

export default RichTextEditor
