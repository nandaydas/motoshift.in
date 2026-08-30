import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getMediaAdmin, uploadMediaAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { X, Search, Upload, Check, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function MediaSelectModal({
  isOpen,
  onClose,
  onSelectImage,
  onSelect,
  title = 'Select Media Image for Content',
  initialTab = 'library'
}) {
  const { showToast, user } = useApp();
  const [activeTab, setActiveTab] = useState(initialTab); // 'upload' | 'library'
  
  // Media List & Selected State
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Filter & Pagination States
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    } else {
      setSelectedMedia(null);
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await getMediaAdmin();
      setMediaList(data || []);
    } catch (err) {
      showToast('Error loading media library', 'error');
    }
    setLoading(false);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setUploadStatusText('Preparing image asset...');

    const timer1 = setTimeout(() => {
      setUploadProgress(60);
      setUploadStatusText('Uploading to storage...');
    }, 400);

    try {
      const record = await uploadMediaAdmin(file, user?.id);
      clearTimeout(timer1);
      setUploadProgress(100);
      setUploadStatusText('Upload complete!');

      setMediaList(prev => [record, ...prev]);
      setSelectedMedia(record);
      showToast('Image uploaded successfully!', 'success');

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setActiveTab('library');
      }, 400);
    } catch (err) {
      clearTimeout(timer1);
      setUploading(false);
      setUploadProgress(0);
      showToast('Failed to upload image', 'error');
    }
  };

  if (!isOpen) return null;

  // Filtering Logic
  const filteredMedia = mediaList.filter(item => {
    const filename = (item.original_filename || item.filename || '').toLowerCase();
    const titleText = (item.title || '').toLowerCase();
    const matchesSearch = !appliedSearch || filename.includes(appliedSearch.toLowerCase()) || titleText.includes(appliedSearch.toLowerCase());
    
    let matchesType = true;
    if (mediaTypeFilter === 'images') {
      matchesType = item.mime_type?.startsWith('image/');
    }

    return matchesSearch && matchesType;
  });

  // Pagination Logic
  const totalItems = filteredMedia.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = filteredMedia.slice(startIndex, startIndex + itemsPerPage);

  const handleConfirmSelection = () => {
    if (!selectedMedia?.public_url) return;
    const url = selectedMedia.public_url;
    const callback = onSelectImage || onSelect;
    if (typeof callback === 'function') {
      callback(url, selectedMedia);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl bg-[#141414] text-gray-100 border border-moto-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[850px]">
        
        {/* Modal Top Header */}
        <div className="px-6 pt-5 pb-0 border-b border-moto-border bg-[#0d0d0d]">
          <div className="flex items-center justify-between pb-4">
            <h2 className="font-heading text-xl text-white font-extrabold tracking-wide">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-moto-panel transition-colors"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs (Upload files / Media Library) */}
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-moto-orange text-moto-orange font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Upload files
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-moto-orange text-moto-orange font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Media Library
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#111111] flex flex-col">
          
          {/* TAB 1: UPLOAD FILES */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-all ${
                isDragOver ? 'border-moto-orange bg-moto-orange/10' : 'border-moto-border bg-[#161616]'
              }`}
            >
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 rounded-full bg-moto-panel border border-moto-border flex items-center justify-center mx-auto text-moto-orange shadow-lg">
                  <Upload size={32} />
                </div>

                <h3 className="text-xl font-bold text-white tracking-wide">Drop files to upload</h3>
                <p className="text-xs text-gray-500 font-mono uppercase">or</p>

                <label className="inline-block bg-moto-orange hover:bg-moto-orange-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-glow-orange cursor-pointer transition-all">
                  <span>{uploading ? 'Uploading...' : 'Select Files'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Progress Status Bar during upload */}
                {uploading && (
                  <div className="space-y-2 pt-4 text-left max-w-xs mx-auto animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-300 font-semibold">{uploadStatusText}</span>
                      <span className="text-moto-orange font-bold">{uploadProgress}%</span>
                    </div>

                    <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden border border-moto-border shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-moto-orange to-[#ff7733] rounded-full transition-all duration-300 shadow-glow-orange"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-gray-500 font-mono pt-4">Maximum upload file size: 50 MB.</p>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA LIBRARY */}
          {activeTab === 'library' && (
            <div className="flex-1 flex flex-col space-y-4">
              
              {/* Controls Toolbar */}
              <div className="bg-[#181818] border border-moto-border p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 font-mono text-[11px]">Filter by type</span>
                    <select
                      value={mediaTypeFilter}
                      onChange={(e) => { setMediaTypeFilter(e.target.value); setCurrentPage(1); }}
                      className="bg-[#0e0e0e] border border-moto-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
                    >
                      <option value="all">All media items</option>
                      <option value="images">Images</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 font-mono text-[11px]">Items per page</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-[#0e0e0e] border border-moto-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={48}>48 per page</option>
                    </select>
                  </div>
                </div>

                {/* Search input */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <span className="text-gray-400 font-mono text-[11px] hidden sm:inline">Search media</span>
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      placeholder="Search filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchQuery); }}
                      className="bg-[#0e0e0e] border border-moto-border rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange w-full sm:w-44 pr-7"
                    />
                    <Search size={13} className="absolute right-2 top-2.5 text-gray-500" />
                  </div>
                  <button
                    onClick={() => setAppliedSearch(searchQuery)}
                    className="bg-[#242424] hover:bg-moto-border text-gray-200 border border-moto-border px-3 py-1.5 rounded font-semibold text-xs transition-colors"
                  >
                    Search
                  </button>
                </div>

              </div>

              {/* Media Thumbnails Grid */}
              <div className="flex-1 min-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-gray-400 font-mono text-xs gap-2 py-20">
                    <Loader2 size={18} className="animate-spin text-moto-orange" />
                    <span>Loading media assets...</span>
                  </div>
                ) : paginatedMedia.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {paginatedMedia.map((item) => {
                      const isSelected = selectedMedia?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMedia(item)}
                          onDoubleClick={handleConfirmSelection}
                          className={`group aspect-square rounded-lg overflow-hidden border bg-black relative cursor-pointer shadow-md transition-all ${
                            isSelected
                              ? 'border-moto-orange ring-2 ring-moto-orange ring-offset-2 ring-offset-[#111111]'
                              : 'border-moto-border hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={item.public_url}
                            alt={item.original_filename || item.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Selected Checkmark Badge */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-moto-orange text-white flex items-center justify-center shadow-lg border border-white/20">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}

                          {/* Filename Overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-1.5 text-[10px] text-gray-300 font-mono truncate border-t border-white/10 opacity-90">
                            <span className="truncate block">{item.original_filename || item.filename}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 py-16 space-y-2">
                    <ImageIcon size={36} className="text-gray-600" />
                    <p className="text-xs">No media files found.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-3.5 border-t border-moto-border bg-[#0d0d0d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Pagination Counter & Navigation */}
          <div className="flex items-center gap-3 text-gray-400 font-mono text-[11px] w-full sm:w-auto justify-between sm:justify-start">
            <span>
              {totalItems > 0
                ? `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems} media items`
                : '0 items'}
            </span>

            {activeTab === 'library' && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2 py-1 rounded bg-[#181818] border border-moto-border text-gray-300 hover:text-white disabled:opacity-30 flex items-center gap-0.5"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2 py-1 rounded bg-[#181818] border border-moto-border text-gray-300 hover:text-white disabled:opacity-30 flex items-center gap-0.5"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1c1c1c] hover:bg-[#282828] text-gray-300 border border-moto-border rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedMedia}
              onClick={handleConfirmSelection}
              className="bg-moto-orange hover:bg-moto-orange-hover disabled:opacity-40 disabled:hover:bg-moto-orange text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-lg shadow-glow-orange transition-all"
            >
              Select Image
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
