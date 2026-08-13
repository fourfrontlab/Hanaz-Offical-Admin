import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface Props {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
}

export default function DragDropImageUploader({ imageUrls, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    const newUrls = [...imageUrls];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image.`);
        continue;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error uploading ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        newUrls.push(publicUrlData.publicUrl);
      }
    }

    onChange(newUrls);
    setIsUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    onChange(updatedUrls);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-neutral-300 hover:border-brand-400 bg-neutral-50 hover:bg-neutral-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-brand-600 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-500 space-y-2">
            <UploadCloud className="w-8 h-8 text-neutral-400" />
            <p className="text-sm font-medium text-neutral-700">Click or drag images to upload</p>
            <p className="text-xs">Supports JPG, PNG, WEBP (Max 5MB)</p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-4">
          {imageUrls.map((url, index) => (
            <div key={url} className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-square">
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
