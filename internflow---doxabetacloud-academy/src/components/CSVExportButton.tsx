import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '../utils/csvExport';

interface CSVExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  columnMapping?: Record<string, string>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const CSVExportButton: React.FC<CSVExportButtonProps> = ({
  data,
  filename,
  title = 'Export CSV',
  columnMapping,
  className = '',
  variant = 'outline'
}) => {
  const handleExport = () => {
    exportToCSV(filename, data, columnMapping);
  };

  const count = data ? data.length : 0;

  const baseStyles = "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer";
  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent active:scale-98",
    secondary: "bg-amber-500 hover:bg-amber-600 text-slate-900 border border-transparent font-bold active:scale-98",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      title={`Export currently visible ${count} records to .csv`}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>{title}</span>
      <span className="px-1.5 py-0.2 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-mono font-medium">
        {count}
      </span>
      <Download className="w-3 h-3 text-slate-400" />
    </button>
  );
};
