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
        bg-white/60 backdrop-blur-lg
        rounded-2xl
        border border-diary-100
        shadow-soft
        hover:shadow-soft-lg hover:bg-white/70
        transition-all duration-300
        focus-within:ring-2 focus-within:ring-diary-300/50 focus-within:bg-white/80
      ">
        {/* 搜索图标 */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-diary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
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
            placeholder:text-diary-300
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
              text-diary-300 hover:text-diary-500
              transition-colors duration-300
            "
            title="清除"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
