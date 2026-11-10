import React, { useState } from 'react';
import { formatRupiah } from '../../lib/storage.ts';

// 1. Income vs Expense Bar / Area Chart
interface IncomeExpenseChartProps {
  data: {
    label: string;
    income: number;
    expense: number;
  }[];
  height?: number;
}

export function IncomeExpenseChart({ data, height = 240 }: IncomeExpenseChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Belum ada data transaksi untuk periode ini
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 100000);
  const chartHeight = height - 40;

  return (
    <div className="relative w-full select-none">
      <div className="relative flex items-end justify-between gap-2 pt-6" style={{ height: `${height}px` }}>
        {/* Background Grid Lines */}
        <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-slate-800" />
          <div className="border-b border-slate-100 dark:border-slate-800" />
          <div className="border-b border-slate-100 dark:border-slate-800" />
        </div>

        {data.map((item, index) => {
          const incHeight = Math.max(4, (item.income / maxVal) * chartHeight);
          const expHeight = Math.max(4, (item.expense / maxVal) * chartHeight);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.label + index}
              className="relative flex flex-1 flex-col items-center justify-end h-full group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setHoveredIndex(isHovered ? null : index)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-14 z-20 whitespace-nowrap rounded-lg bg-slate-900/95 dark:bg-slate-800/95 px-2.5 py-1.5 text-xs text-white shadow-xl backdrop-blur-sm pointer-events-none transition-all">
                  <div className="font-semibold text-slate-300">{item.label}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400">+{formatRupiah(item.income)}</span>
                    <span className="text-rose-400">-{formatRupiah(item.expense)}</span>
                  </div>
                </div>
              )}

              {/* Bars Pair */}
              <div className="flex items-end gap-1.5 w-full max-w-[48px] justify-center">
                {/* Income Bar */}
                <div
                  style={{ height: `${incHeight}px` }}
                  className={`w-1/2 rounded-t-md transition-all duration-300 ${
                    isHovered
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-emerald-500/80 hover:bg-emerald-500'
                  }`}
                />
                {/* Expense Bar */}
                <div
                  style={{ height: `${expHeight}px` }}
                  className={`w-1/2 rounded-t-md transition-all duration-300 ${
                    isHovered
                      ? 'bg-rose-500 shadow-md shadow-rose-500/20'
                      : 'bg-rose-500/80 hover:bg-rose-500'
                  }`}
                />
              </div>

              {/* Label */}
              <span className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[50px] text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span>Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}

// 2. Saldo Trend Line Chart (SVG Smooth Curve)
interface BalanceTrendChartProps {
  data: {
    date: string;
    balance: number;
  }[];
  height?: number;
}

export function BalanceTrendChart({ data, height = 220 }: BalanceTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; item: { date: string; balance: number } } | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Data riwayat saldo belum mencukupi untuk membuat tren
      </div>
    );
  }

  const paddingX = 24;
  const paddingY = 24;
  const svgWidth = 600;
  const svgHeight = height;

  const minVal = Math.min(...data.map((d) => d.balance));
  const maxVal = Math.max(...data.map((d) => d.balance));
  const range = maxVal - minVal || 1;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.balance - minVal) / range) * (svgHeight - paddingY * 2);
    return { x, y, item: d };
  });

  const pathD = points.reduce((acc, point, index, arr) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[index - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: `${height}px` }}
      >
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Guide Lines */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={svgWidth - paddingX}
          y2={paddingY}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={svgHeight - paddingY}
          x2={svgWidth - paddingX}
          y2={svgHeight - paddingY}
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
        />

        {/* Gradient Fill */}
        <path d={areaD} fill="url(#balanceGrad)" />

        {/* Smooth Line */}
        <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint?.item.date === p.item.date ? 6 : 4}
            className={`fill-white dark:fill-slate-900 stroke-blue-600 transition-all cursor-pointer ${
              hoveredPoint?.item.date === p.item.date ? 'stroke-[3px]' : 'stroke-2'
            }`}
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900/90 dark:bg-slate-800/95 px-2.5 py-1.5 text-xs text-white shadow-xl pointer-events-none"
          style={{
            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
            top: `${(hoveredPoint.y / svgHeight) * 100 - 10}%`,
          }}
        >
          <div className="text-[10px] text-slate-300">{hoveredPoint.item.date}</div>
          <div className="font-semibold text-blue-300">{formatRupiah(hoveredPoint.item.balance)}</div>
        </div>
      )}

      {/* Date Axis */}
      <div className="flex justify-between px-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// 3. Category Donut / Pie Chart with Interactive Legend
interface CategoryPieChartProps {
  categories: {
    name: string;
    amount: number;
    color: string;
    icon?: string;
  }[];
}

export function CategoryPieChart({ categories }: CategoryPieChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  if (total === 0 || categories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Belum ada pengeluaran pada periode ini
      </div>
    );
  }

  // Calculate SVG arc paths for donut
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* Donut Visual */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90 select-none">
          {categories.map((cat, idx) => {
            const percentage = cat.amount / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += percentage * circumference;
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={cat.name}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
            {formatRupiah(hoveredIdx !== null ? categories[hoveredIdx].amount : total)}
          </span>
          {hoveredIdx !== null && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[80px]">
              {categories[hoveredIdx].name}
            </span>
          )}
        </div>
      </div>

      {/* Legend Items */}
      <div className="flex flex-col gap-2 w-full max-w-xs max-h-48 overflow-y-auto pr-1">
        {categories.slice(0, 6).map((cat, idx) => {
          const pct = Math.round((cat.amount / total) * 100);
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={cat.name}
              className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                <span className="text-slate-500 dark:text-slate-400">{pct}%</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(cat.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Partner Comparison Side-by-Side Chart (Saya vs Rekan)
interface ComparisonBarProps {
  label: string;
  myName: string;
  myAmount: number;
  partnerName: string;
  partnerAmount: number;
}

export function ComparisonBar({ label, myName, myAmount, partnerName, partnerAmount }: ComparisonBarProps) {
  const max = Math.max(myAmount, partnerAmount, 1);
  const myPct = Math.round((myAmount / max) * 100);
  const partnerPct = Math.round((partnerAmount / max) * 100);

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums font-bold text-slate-900 dark:text-white">
          Total: {formatRupiah(myAmount + partnerAmount)}
        </span>
      </div>

      {/* My Row */}
      <div className="flex items-center gap-2 text-xs">
        <span className="w-20 truncate text-slate-500 dark:text-slate-400 font-medium">{myName}</span>
        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${myPct}%` }}
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
          />
        </div>
        <span className="w-24 text-right font-medium text-blue-600 dark:text-blue-400 tabular-nums">
          {formatRupiah(myAmount)}
        </span>
      </div>

      {/* Partner Row */}
      <div className="flex items-center gap-2 text-xs">
        <span className="w-20 truncate text-slate-500 dark:text-slate-400 font-medium">{partnerName}</span>
        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${partnerPct}%` }}
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          />
        </div>
        <span className="w-24 text-right font-medium text-indigo-500 dark:text-indigo-400 tabular-nums">
          {formatRupiah(partnerAmount)}
        </span>
      </div>
    </div>
  );
}
