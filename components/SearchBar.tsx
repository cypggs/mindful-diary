'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = '搜索记忆...' }: SearchBarProps) {
  return (
    <div className="relative mb-6">
      <div className="
        relative
        bg-white
        rounded-2xl
        border border-diary-200
        shadow-md
        hover:shadow-lg hover:border-diary-300
        transition-all duration-300
        focus-within:ring-2 focus-within:ring-diary-400/30 focus-within:border-diary-400
      ">
        {/* 搜索 emoji */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl">
          🔍
        </div>

        {/* 输入框 */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full
            pl-12 pr-12 py-3.5
            bg-transparent
            text-diary-800
            placeholder:text-diary-400
            border-0 focus:ring-0 focus:outline-none
            transition-all duration-300
          "
        />

        {/* 清除按钮 */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="
              absolute inset-y-0 right-0 pr-4
              flex items-center
              text-diary-400 hover:text-diary-600
              transition-colors duration-200
              text-lg
            "
            title="清除"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
