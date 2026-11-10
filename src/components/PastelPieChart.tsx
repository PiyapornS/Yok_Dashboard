import React, { useState } from 'react';

export interface PieSliceData {
  id: string;
  label: string;
  shortLabel: string;
  value: number; // score or count
  formattedValue: string;
  pastelColor: string;
  pastelHoverColor: string;
  textColor: string;
  subtext?: string;
}

interface PastelPieChartProps {
  data: PieSliceData[];
  centerLabel?: string;
  centerValue?: string;
  centerSubtext?: string;
  isDonut?: boolean;
}

export const PastelPieChart: React.FC<PastelPieChartProps> = ({
  data,
  centerLabel = 'คะแนนเฉลี่ยรวม',
  centerValue = '0.00',
  centerSubtext = '',
  isDonut = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = data.reduce((acc, slice) => acc + (slice.value > 0 ? slice.value : 0), 0);

  // If no data
  if (totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-slate-500 text-sm">
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-800 flex items-center justify-center mb-4">
          <span className="text-xs text-slate-500">รอข้อมูลผลการประเมิน</span>
        </div>
      </div>
    );
  }

  const size = 320;
  const center = size / 2;
  const outerRadius = 125;
  const innerRadius = isDonut ? 78 : 0;

  // Calculate arc paths
  let currentAngle = -90; // Start at top 12 o'clock

  const slices = data.map((slice, index) => {
    const fraction = totalValue > 0 ? (slice.value > 0 ? slice.value : 0) / totalValue : 0;
    const angleSpan = fraction * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle += angleSpan;

    // Convert polar to cartesian coordinates
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const isHovered = hoveredIndex === index;
    const offset = isHovered ? 6 : 0;
    const midAngle = startAngle + angleSpan / 2;
    const offsetX = offset * Math.cos(toRad(midAngle));
    const offsetY = offset * Math.sin(toRad(midAngle));

    const cx = center + offsetX;
    const cy = center + offsetY;

    const x1 = cx + outerRadius * Math.cos(toRad(startAngle));
    const y1 = cy + outerRadius * Math.sin(toRad(startAngle));
    const x2 = cx + outerRadius * Math.cos(toRad(endAngle));
    const y2 = cy + outerRadius * Math.sin(toRad(endAngle));

    const ix1 = cx + innerRadius * Math.cos(toRad(endAngle));
    const iy1 = cy + innerRadius * Math.sin(toRad(endAngle));
    const ix2 = cx + innerRadius * Math.cos(toRad(startAngle));
    const iy2 = cy + innerRadius * Math.sin(toRad(startAngle));

    const largeArcFlag = angleSpan > 180 ? 1 : 0;

    const pathData = isDonut
      ? `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const percentage = (fraction * 100).toFixed(1);

    return {
      ...slice,
      index,
      pathData,
      percentage,
      isHovered
    };
  });

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* SVG Pie / Donut Chart */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-sm select-none transition-transform"
        >
          <g>
            {slices.map((slice) => (
              <path
                key={slice.id}
                d={slice.pathData}
                fill={slice.isHovered ? slice.pastelHoverColor : slice.pastelColor}
                stroke="#ffffff"
                strokeWidth={3}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </g>
        </svg>

        {/* Center Text inside Donut Hole */}
        {isDonut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {hoveredIndex !== null && slices[hoveredIndex] ? (
              <>
                <span className="text-[11px] font-medium text-slate-500 line-clamp-1 max-w-[120px]">
                  {slices[hoveredIndex].shortLabel}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {slices[hoveredIndex].formattedValue}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600">
                  {slices[hoveredIndex].percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {centerLabel}
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {centerValue}
                </span>
                {centerSubtext && (
                  <span className="text-[11px] font-medium text-emerald-600">
                    {centerSubtext}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Pastel Legends & Score details */}
      <div className="flex-1 w-full space-y-2.5">
        {slices.map((slice) => {
          const isSelected = hoveredIndex === slice.index;
          return (
            <div
              key={slice.id}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-white border-slate-300 shadow-sm scale-[1.01]'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Pastel Color Swatch + Label */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white"
                  style={{ backgroundColor: slice.pastelColor }}
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                    {slice.label}
                  </div>
                  {slice.subtext && (
                    <div className="text-[11px] text-slate-500">
                      {slice.subtext}
                    </div>
                  )}
                </div>
              </div>

              {/* Value and Percentage */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                  {slice.formattedValue}
                </span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-slate-900 font-mono shadow-2xs"
                  style={{ backgroundColor: slice.pastelColor }}
                >
                  {slice.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
