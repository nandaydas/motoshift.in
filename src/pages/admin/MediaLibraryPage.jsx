import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getMediaAdmin, uploadMediaAdmin, updateMediaAdmin, deleteMediaAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { 
  LayoutGrid, List, Search, Upload, X, ChevronLeft, ChevronRight, 
  Copy, Check, Edit3, Image as ImageIcon 
} from 'lucide-react';
import { format } from 'date-fns';

export default function MediaLibraryPage() {
  const { showToast, user } = useApp();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // View & Filter States
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Selected Item Modal State
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editForm, setEditForm] = useState({
    alt_text: '',
    title: '',
    caption: '',
    description: ''
  });
  const [copied, setCopied] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    const data = await getMediaAdmin();
    setMediaList(data);
    setLoading(false);
  }

  // Dropzone & Progress States (Hidden by default, shown when clicking button or uploading)
  const [showDropzone, setShowDropzone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('Uploading to Cloudinary (100%)...');
  const [isDragOver, setIsDragOver] = useState(false);

  async function processFileUpload(file) {
    if (!file) return;

    setUploading(true);
    setShowDropzone(true);
    setUploadProgress(15);
    setUploadStatusText('Compressing image file...');

    const timer1 = setTimeout(() => {
      setUploadProgress(45);
      setUploadStatusText('Uploading to Cloudinary...');
    }, 400);

    const timer2 = setTimeout(() => {
      setUploadProgress(85);
      setUploadStatusText('Uploading to Cloudinary (100%)...');
    }, 900);

    try {
      const record = await uploadMediaAdmin(file, user?.id);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setUploadProgress(100);
      setUploadStatusText('Upload completed!');
      
      setMediaList(prev => [record, ...prev]);
      showToast('Media file uploaded successfully!', 'success');

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setShowDropzone(false);
      }, 1200);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setUploading(false);
      setUploadProgress(0);
      showToast('Failed to upload image', 'error');
    }
  }

  // Filter & Search Logic
  const filteredMedia = mediaList.filter(item => {
    const filename = (item.original_filename || item.filename || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const matchesSearch = !appliedSearch || filename.includes(appliedSearch.toLowerCase()) || title.includes(appliedSearch.toLowerCase());
    
    let matchesType = true;
    if (mediaTypeFilter === 'images') {
      matchesType = item.mime_type?.startsWith('image/');
    } else if (mediaTypeFilter === 'documents') {
      matchesType = !item.mime_type?.startsWith('image/');
    }
    
    return matchesSearch && matchesType;
  });

  // Pagination Logic
  const totalItems = filteredMedia.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = filteredMedia.slice(startIndex, startIndex + itemsPerPage);

  // Modal Open & Selection Handlers
  const openDetailsModal = (item) => {
    setSelectedMedia(item);
    setEditForm({
      alt_text: item.alt_text || '',
      title: item.title || item.original_filename || item.filename || '',
      caption: item.caption || '',
      description: item.description || ''
    });
    setCopied(false);
  };

  const handleNavigateModal = (direction) => {
    if (!selectedMedia) return;
    const currentIndex = filteredMedia.findIndex(m => m.id === selectedMedia.id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = filteredMedia.length - 1;
    if (nextIndex >= filteredMedia.length) nextIndex = 0;

    openDetailsModal(filteredMedia[nextIndex]);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedMedia) return;

    setSavingEdit(true);
    try {
      const updated = await updateMediaAdmin(selectedMedia.id, editForm);
      setMediaList(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, ...editForm } : m));
      setSelectedMedia(prev => ({ ...prev, ...editForm }));
      showToast('Media details updated successfully!', 'success');
    } catch (err) {
      showToast('Error updating media details', 'error');
    }
    setSavingEdit(false);
  };

  const handleDeletePermanently = async () => {
    if (!selectedMedia) return;
    if (window.confirm(`Permanently delete "${selectedMedia.original_filename || selectedMedia.filename}"?`)) {
      await deleteMediaAdmin(selectedMedia.id);
      setMediaList(prev => prev.filter(m => m.id !== selectedMedia.id));
      showToast('Media file deleted permanently', 'info');
      setSelectedMedia(null);
    }
  };

  const copyUrlToClipboard = () => {
    if (!selectedMedia?.public_url) return;
    navigator.clipboard.writeText(selectedMedia.public_url);
    setCopied(true);
    showToast('Public URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-moto-border pb-4">
        <h1 className="font-heading text-3xl text-white font-extrabold tracking-wide">
          Media Library
        </h1>

        <button
          onClick={() => setShowDropzone(prev => !prev)}
          className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-glow-orange transition-all flex items-center gap-2"
        >
          <Upload size={16} />
          <span>{(showDropzone || uploading) ? 'Hide Upload Area' : 'Add Media File'}</span>
        </button>
      </div>

      {/* Drop Files to Upload Box (Only shown when clicking button or uploading) */}
      {(showDropzone || uploading) && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) processFileUpload(e.dataTransfer.files[0]);
          }}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            isDragOver ? 'border-moto-orange bg-moto-orange/10' : 'border-moto-border/80 bg-[#121212]'
          }`}
        >
          {/* Close Icon Button */}
          <button
            onClick={() => setShowDropzone(false)}
            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white rounded transition-colors"
            title="Close upload box"
          >
            <X size={18} />
          </button>

          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white tracking-wide">Drop files to upload</h3>
            <p className="text-xs text-gray-500 font-mono uppercase">or</p>

            <label className="inline-block bg-moto-orange hover:bg-moto-orange-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-glow-orange cursor-pointer transition-all">
              <span>{uploading ? 'Uploading...' : 'Select Files'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) processFileUpload(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>

            {/* Upload Progress Status Indicator Bar */}
            {uploading && (
              <div className="space-y-2 pt-2 text-left max-w-md mx-auto animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-semibold">{uploadStatusText}</span>
                  <span className="text-moto-orange font-bold">{uploadProgress}%</span>
                </div>

                <div className="w-full h-2.5 bg-[#090909] rounded-full overflow-hidden border border-moto-border shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-moto-orange to-[#ff7733] rounded-full transition-all duration-300 shadow-glow-orange"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-500 font-mono">Maximum upload file size: 50 Mb.</p>
          </div>
        </div>
      )}

      {/* Control & Filter Toolbar (WordPress Style) */}
      <div className="bg-[#111111] border border-moto-border p-3 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-gray-300">
        
        {/* Left Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-moto-border rounded bg-[#181818] overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-moto-orange text-white' : 'text-gray-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-moto-orange text-white' : 'text-gray-400 hover:text-white'}`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

          {/* Media Items Type Filter */}
          <select
            value={mediaTypeFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value)}
            className="bg-[#181818] border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
          >
            <option value="all">All media items</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
          </select>

          {/* Items Per Page Filter */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#181818] border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
          >
            <option value={12}>12 items / page</option>
            <option value={24}>24 items / page</option>
            <option value={48}>48 items / page</option>
            <option value={96}>96 items / page</option>
          </select>

          <button
            onClick={() => setCurrentPage(1)}
            className="bg-[#1f1f1f] hover:bg-moto-border text-gray-200 border border-moto-border px-3 py-1.5 rounded font-semibold"
          >
            Filter
          </button>
        </div>

        {/* Right Toolbar Controls (Search & Pagination) */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 w-full lg:w-auto">
          
          {/* Search Box */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400 font-mono text-[11px] hidden sm:inline">Search media</span>
            <input
              type="text"
              placeholder="Search filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setAppliedSearch(searchQuery);
              }}
              className="bg-[#181818] border border-moto-border rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange w-36 sm:w-44"
            />
            <button
              onClick={() => setAppliedSearch(searchQuery)}
              className="bg-[#1f1f1f] hover:bg-moto-border text-gray-200 border border-moto-border px-3 py-1.5 rounded font-semibold"
            >
              Search
            </button>
          </div>

          {/* Pagination Counter & Arrows */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
            <span>{totalItems > 0 ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems} items` : '0 items'}</span>
            
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded bg-[#181818] border border-moto-border text-gray-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>

              <span>Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong></span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded bg-[#181818] border border-moto-border text-gray-300 hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Media Grid or List View */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading media library from Supabase...
        </div>
      ) : paginatedMedia.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View Layout (Larger Thumbnail Cards) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {paginatedMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetailsModal(item)}
                className={`group aspect-square rounded overflow-hidden border bg-black relative cursor-pointer shadow-md transition-all ${
                  selectedMedia?.id === item.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-moto-border hover:border-moto-orange'
                }`}
              >
                <img
                  src={item.public_url}
                  alt={item.original_filename || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Filename Bottom Overlay Bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-1.5 text-[10px] text-gray-200 font-mono truncate border-t border-white/10">
                  <span className="truncate block opacity-90">{item.original_filename || item.filename}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View Layout Table */
          <div className="bg-[#111111] border border-moto-border rounded-lg overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] uppercase font-mono text-[10px] text-gray-400 border-b border-moto-border">
                <tr>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Title / Filename</th>
                  <th className="px-4 py-3">Dimensions</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-moto-border/40">
                {paginatedMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-[#181818] transition-colors cursor-pointer" onClick={() => openDetailsModal(item)}>
                    <td className="px-4 py-2">
                      <img src={item.public_url} alt="" className="w-10 h-10 object-cover rounded border border-moto-border" />
                    </td>
                    <td className="px-4 py-2 font-bold text-white max-w-xs truncate">
                      {item.title || item.original_filename || item.filename}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-gray-400">
                      {item.width && item.height ? `${item.width} x ${item.height}` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-gray-400">
                      {item.size ? `${(item.size / 1024).toFixed(0)} KB` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-[11px]">
                      {item.created_at ? format(new Date(item.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailsModal(item);
                        }}
                        className="text-moto-orange hover:underline font-bold text-xs"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="py-20 text-center space-y-3 bg-[#111111] border border-moto-border rounded-lg">
          <ImageIcon size={40} className="mx-auto text-gray-600" />
          <p className="text-gray-400 text-sm">No media items found matching criteria.</p>
        </div>
      )}

      {/* Attachment Details Modal (Full Viewport Portal + Dark Theme) */}
      {selectedMedia && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl bg-[#141414] text-gray-100 border border-moto-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-moto-border bg-[#0b0b0b] flex items-center justify-between">
              <h3 className="font-heading text-lg text-white font-extrabold tracking-wide uppercase">Attachment details</h3>
              
              <div className="flex items-center gap-3">
                {/* Previous & Next Item Navigation */}
                <button
                  onClick={() => handleNavigateModal(-1)}
                  className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-moto-panel transition-colors"
                  title="Previous item"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handleNavigateModal(1)}
                  className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-moto-panel transition-colors"
                  title="Next item"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="h-4 w-px bg-moto-border" />
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-moto-panel transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content Split View */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-moto-border">
              
              {/* Left Column: Large Image Preview */}
              <div className="md:col-span-6 p-6 flex flex-col items-center justify-center bg-[#070707] space-y-4">
                <div className="max-h-[420px] w-full flex items-center justify-center overflow-hidden rounded border border-moto-border bg-black p-2 shadow-inner">
                  <img
                    src={selectedMedia.public_url}
                    alt={selectedMedia.alt_text || selectedMedia.filename}
                    className="max-h-[390px] w-auto object-contain rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={copyUrlToClipboard}
                  className="px-4 py-1.5 bg-[#181818] hover:bg-moto-panel border border-moto-border text-xs font-semibold text-moto-orange rounded flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Edit3 size={14} className="text-moto-orange" />
                  <span>Copy Image Direct Link</span>
                </button>
              </div>

              {/* Right Column: Metadata & Editable Form Fields */}
              <div className="md:col-span-6 p-6 space-y-5 bg-[#121212] text-gray-200">
                
                {/* Metadata Description Block */}
                <div className="space-y-1.5 text-xs text-gray-400 border-b border-moto-border pb-4 font-sans">
                  <p><strong className="text-gray-200 font-semibold">Uploaded on:</strong> {selectedMedia.created_at ? format(new Date(selectedMedia.created_at), 'MMMM dd, yyyy') : 'Recently'}</p>
                  <p><strong className="text-gray-200 font-semibold">Uploaded by:</strong> {user?.name || 'Nanday Das'}</p>
                  <p><strong className="text-gray-200 font-semibold">File name:</strong> {selectedMedia.original_filename || selectedMedia.filename}</p>
                  <p><strong className="text-gray-200 font-semibold">File type:</strong> {selectedMedia.mime_type || 'image/jpeg'}</p>
                  <p><strong className="text-gray-200 font-semibold">File size:</strong> {selectedMedia.size ? `${(selectedMedia.size / 1024).toFixed(0)} KB` : 'N/A'}</p>
                  <p><strong className="text-gray-200 font-semibold">Dimensions:</strong> {selectedMedia.width && selectedMedia.height ? `${selectedMedia.width} by ${selectedMedia.height} pixels` : 'N/A'}</p>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSaveChanges} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Alternative Text</label>
                    <input
                      type="text"
                      placeholder="Describe the image for accessibility..."
                      value={editForm.alt_text}
                      onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
                      className="w-full bg-[#080808] border border-moto-border rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full bg-[#080808] border border-moto-border rounded px-3 py-2 text-white focus:outline-none focus:border-moto-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Caption</label>
                    <textarea
                      rows={2}
                      value={editForm.caption}
                      onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                      className="w-full bg-[#080808] border border-moto-border rounded px-3 py-2 text-white focus:outline-none focus:border-moto-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-[#080808] border border-moto-border rounded px-3 py-2 text-white focus:outline-none focus:border-moto-orange text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">File URL</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.public_url}
                      className="w-full bg-[#050505] border border-moto-border rounded px-3 py-2 text-gray-400 text-[11px] font-mono cursor-default focus:outline-none"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={copyUrlToClipboard}
                      className="px-3 py-1.5 bg-[#181818] hover:bg-moto-panel border border-moto-border rounded text-moto-orange font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied to clipboard' : 'Copy URL to clipboard'}</span>
                    </button>
                  </div>
                </form>

              </div>

            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-3.5 border-t border-moto-border bg-[#0b0b0b] flex items-center justify-between">
              <button
                type="button"
                onClick={handleDeletePermanently}
                className="text-red-400 hover:text-red-300 font-semibold text-xs hover:underline"
              >
                Delete permanently
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={savingEdit}
                className="bg-moto-orange hover:bg-moto-orange-hover text-white font-bold text-xs uppercase px-6 py-2 rounded shadow-glow-orange transition-all"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
