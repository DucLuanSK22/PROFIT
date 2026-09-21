import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, Search, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface ExcelColumnFilterProps {
  columnKey: string;
  columnTitle: string;
  uniqueValues: string[];
  selectedValues: Set<string>;
  onSelectValuesChange: (newSelected: Set<string>) => void;
  isNumeric?: boolean;
  minNum?: number;
  maxNum?: number;
  numRange?: [number, number];
  onNumRangeChange?: (range: [number, number]) => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  currentSortField?: string;
  currentSortOrder?: 'asc' | 'desc';
}

export const ExcelColumnFilter: React.FC<ExcelColumnFilterProps> = ({
  columnKey,
  columnTitle,
  uniqueValues,
  selectedValues,
  onSelectValuesChange,
  isNumeric = false,
  minNum = 0,
  maxNum = 100,
  numRange,
  onNumRangeChange,
  onSortAsc,
  onSortDesc,
  currentSortField,
  currentSortOrder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const isFiltered = selectedValues.size < uniqueValues.length || (numRange && (numRange[0] > minNum || numRange[1] < maxNum));
  const isSorted = currentSortField === columnKey;

  // Filter unique values by search query inside popover
  const filteredUniqueValues = useMemo(() => {
    if (!searchQuery.trim()) return uniqueValues;
    const q = searchQuery.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(q));
  }, [uniqueValues, searchQuery]);

  // Click outside listener to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isAllSelected = selectedValues.size === uniqueValues.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onSelectValuesChange(new Set());
    } else {
      onSelectValuesChange(new Set(uniqueValues));
    }
  };

  const handleToggleValue = (val: string) => {
    const next = new Set(selectedValues);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    onSelectValuesChange(next);
  };

  const handleClearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectValuesChange(new Set(uniqueValues));
    if (onNumRangeChange && minNum !== undefined && maxNum !== undefined) {
      onNumRangeChange([minNum, maxNum]);
    }
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Filter Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded-md transition-all ${
          isFiltered
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-1 ring-blue-400'
            : isSorted
            ? 'bg-slate-800 text-blue-400'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title={`Lọc cột ${columnTitle} kiểu Excel`}
      >
        <Filter className="w-3.5 h-3.5" />
      </button>

      {/* Popover Dropdown Menu (Excel Style) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3 space-y-3 text-xs text-slate-200 backdrop-blur-xl animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 truncate">Lọc: {columnTitle}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sort Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onSortAsc();
                setIsOpen(false);
              }}
              className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                isSorted && currentSortOrder === 'asc'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowUp className="w-3 h-3" />
              <span>{isNumeric ? 'Tăng dần' : 'A ➔ Z'}</span>
            </button>

            <button
              onClick={() => {
                onSortDesc();
                setIsOpen(false);
              }}
              className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                isSorted && currentSortOrder === 'desc'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowDown className="w-3 h-3" />
              <span>{isNumeric ? 'Giảm dần' : 'Z ➔ A'}</span>
            </button>
          </div>

          {/* Search values box */}
          {uniqueValues.length > 5 && (
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm giá trị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Values Checkbox List */}
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar border border-slate-800 rounded-lg p-2 bg-slate-950/60">
            {/* Select All Checkbox */}
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:bg-slate-800/60 p-1 rounded font-semibold text-[11px] border-b border-slate-800/80 pb-1 mb-1">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
              <span>(Select All / Chọn tất cả)</span>
            </label>

            {filteredUniqueValues.length === 0 ? (
              <div className="text-center py-2 text-slate-500 text-[11px]">Không tìm thấy</div>
            ) : (
              filteredUniqueValues.map((val) => {
                const checked = selectedValues.has(val);
                return (
                  <label
                    key={val}
                    className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:bg-slate-800/60 p-1 rounded text-[11px] truncate"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleValue(val)}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{val || '(Trống)'}</span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={handleClearFilter}
              className="text-slate-400 hover:text-slate-200 text-[11px] underline"
            >
              Xóa bộ lọc cột này
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
