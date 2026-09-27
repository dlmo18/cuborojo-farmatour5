'use client';

import { MdSearch } from 'react-icons/md';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  onSearch,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
        <MdSearch size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-md leading-5 bg-white placeholder-surface-500 focus:outline-none focus:placeholder-surface-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
      />
    </div>
  );
}
