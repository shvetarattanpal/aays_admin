"use client";

import React, { useEffect } from "react";

interface CollectionType {
  _id: string;
  title: string;
}

interface MultiSelectProps {
  placeholder: string;
  collections: CollectionType[];
  value: string[];
  onChange: (updatedValues: string[]) => void;
  onRemove?: (removedId: string) => void; 
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  placeholder,
  collections,
  value,
  onChange,
  onRemove,
}) => {
  useEffect(() => {
    //console.log("📌 Available collections from API:", collections);
    //console.log("✅ Selected collections (IDs):", value);
  }, [collections, value]);

  const handleSelect = (collectionId: string) => {
    if (value.includes(collectionId)) {
      const updatedValues = value.filter((id) => id !== collectionId);
      onChange(updatedValues);
      onRemove && onRemove(collectionId);
    } else {
      const updatedValues = [...value, collectionId];
      onChange(updatedValues);
    }
  };

  return (
    <div>
      <p>{placeholder}</p>
      <ul>
        {collections.map((collection) => (
          <li key={collection._id}>
            <label>
              <input
                type="checkbox"
                checked={value.includes(collection._id)}
                onChange={() => handleSelect(collection._id)}
              />
              {collection.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultiSelect;