'use client';

import { CldUploadWidget } from 'next-cloudinary';
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Plus, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[] | ((prev: string[]) => string[])) => void;
  onRemove: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
}) => {
  const widgetOpenRef = useRef<(() => void) | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    (result: CloudinaryUploadWidgetResults) => {
      console.log("Cloudinary upload event:", result);

      if (
        result.event === 'success' &&
        result.info !== undefined &&
        typeof result.info !== 'string' &&
        typeof result.info.secure_url === 'string'
      ) {
        const url = result.info.secure_url;

        onChange((prev) => {
          if (prev.includes(url)) return prev;
          return [...prev, url];
        });
      }
    },
    [onChange]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px]">
            <div className="absolute top-0 right-0 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                size="sm"
                className="bg-red-500 text-white"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              src={url}
              alt="Uploaded Image"
              className="object-cover rounded-lg"
              width={500}
              height={300}
              style={{ objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>

      <CldUploadWidget
        uploadPreset="aays_1"
        onSuccess={handleUpload}
        options={{
          multiple: true,
          maxFiles: 10,
        }}
      >
        {({ open }) => {
          widgetOpenRef.current = open;

          return (
            <Button
              type="button"
              onClick={() => {
                if (widgetOpenRef.current && typeof widgetOpenRef.current === 'function') {
                  widgetOpenRef.current();
                } else {
                  console.warn('Upload widget not ready yet.');
                }
              }}
              className="bg-gray-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Image{value.length > 0 ? 's' : ''}
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;