import { ChevronRight } from "lucide-react";

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

/** 与 ui/Content Management Platform 筛选条样式一致 */
export function FilterSelect({ label, value, onChange, options }: Props) {
  return (
    <div className="flex items-center text-sm border border-gray-300 rounded overflow-hidden group hover:border-indigo-400 transition-colors bg-white h-9 relative shrink-0 whitespace-nowrap">
      <span className="px-3 py-1.5 bg-gray-50 border-r border-gray-300 text-gray-600 font-medium shrink-0 whitespace-nowrap">
        {label}
      </span>
      <select
        className="pl-3 pr-8 py-1.5 bg-transparent outline-none text-gray-800 cursor-pointer min-w-24 w-full appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none group-hover:text-indigo-400 rotate-90" />
    </div>
  );
}
