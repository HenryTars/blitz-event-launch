'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';

interface Props {
  currentUrl?: string | null;
  folder?: string;
  label?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ currentUrl, folder = 'general', label = 'Image', onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }

    setError('');
    setSuccess(false);
    setUploading(true);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
      setSuccess(true);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      setPreview(currentUrl || null);
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  }, [folder, onChange, currentUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearPreview = () => {
    setPreview(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs text-slate-400">{label}</label>

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <img src={preview} alt="Preview" className="h-40 w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            {success && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
            <button onClick={clearPreview} disabled={uploading}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2">
            <button onClick={() => inputRef.current?.click()} disabled={uploading}
              className="rounded-lg bg-black/50 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm transition hover:bg-black/70">
              Change
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition ${
            uploading ? 'border-gold/20 bg-gold/5' : 'border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/5'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
              <span className="text-xs text-slate-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-slate-500" />
              <span className="text-xs text-slate-400">Drop image here or click to browse</span>
              <span className="text-[10px] text-slate-600">PNG, JPG, WebP · Max 5MB</span>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400">
          {error}
        </motion.p>
      )}
    </div>
  );
}
