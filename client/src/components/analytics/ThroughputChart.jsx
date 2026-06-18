import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

// Helper to format Date into YYYY-MM-DD
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Generate smooth cubic bezier SVG path from a set of (x, y) coordinates
const generateSmoothPath = (points) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;

    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
};

const ThroughputChart = ({ tickets = [] }) => {
  const [activeMetric, setActiveMetric] = useState('both'); // 'both' | 'completed' | 'created'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const containerRef = useRef(null);

  // Compute 14-day rolling timeline data from actual tickets
  const timelineData = useMemo(() => {
    const days = 14;
    const now = new Date();
    const result = [];

    // Map tickets by date
    const createdMap = {};
    const completedMap = {};

    tickets.forEach((t) => {
      if (t.createdAt) {
        const k = formatDateKey(t.createdAt);
        createdMap[k] = (createdMap[k] || 0) + 1;
      }
      if (t.status === 'DONE' && (t.updatedAt || t.createdAt)) {
        const k = formatDateKey(t.updatedAt || t.createdAt);
        completedMap[k] = (completedMap[k] || 0) + 1;
      }
    });

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);

      result.push({
        date: d,
        dateKey: key,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        created: createdMap[key] || 0,
        completed: completedMap[key] || 0,
      });
    }

    return result;
  }, [tickets]);

  // Chart dimensions & scaling
  const chartHeight = 220;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 32;

  // Max value calculation for Y-scale
  const maxVal = useMemo(() => {
    const maxNumber = Math.max(
      ...timelineData.map((d) => Math.max(d.created, d.completed)),
      4 // Minimum scale baseline
    );
    return Math.ceil(maxNumber * 1.25);
  }, [timelineData]);

  // Coordinate mapper
  const svgPoints = useMemo(() => {
    const width = 800; // Reference viewBox width
    const usableWidth = width - paddingX * 2;
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const stepX = usableWidth / (timelineData.length - 1);

    const completedPts = timelineData.map((d, idx) => ({
      x: paddingX + idx * stepX,
      y: chartHeight - paddingBottom - (d.completed / maxVal) * usableHeight,
      data: d,
    }));

    const createdPts = timelineData.map((d, idx) => ({
      x: paddingX + idx * stepX,
      y: chartHeight - paddingBottom - (d.created / maxVal) * usableHeight,
      data: d,
    }));

    return { completedPts, createdPts, width };
  }, [timelineData, maxVal]);

  // Path strings
  const completedLinePath = useMemo(() => generateSmoothPath(svgPoints.completedPts), [svgPoints]);
  const createdLinePath = useMemo(() => generateSmoothPath(svgPoints.createdPts), [svgPoints]);

  const completedAreaPath = useMemo(() => {
    if (svgPoints.completedPts.length === 0) return '';
    const first = svgPoints.completedPts[0];
    const last = svgPoints.completedPts[svgPoints.completedPts.length - 1];
    const baselineY = chartHeight - paddingBottom;
    return `${completedLinePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [completedLinePath, svgPoints]);

  const createdAreaPath = useMemo(() => {
    if (svgPoints.createdPts.length === 0) return '';
    const first = svgPoints.createdPts[0];
    const last = svgPoints.createdPts[svgPoints.createdPts.length - 1];
    const baselineY = chartHeight - paddingBottom;
    return `${createdLinePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [createdLinePath, svgPoints]);

  // Total sums in the 14-day window
  const totalCompleted14d = timelineData.reduce((acc, d) => acc + d.completed, 0);
  const totalCreated14d = timelineData.reduce((acc, d) => acc + d.created, 0);

  // Velocity momentum index (completed / created ratio)
  const momentumRatio = totalCreated14d > 0 
    ? ((totalCompleted14d / totalCreated14d) * 100).toFixed(0) 
    : 100;

  // Mouse move handler for interactive crosshair
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgPoints.width;

    // Find nearest point
    let nearest = svgPoints.completedPts[0];
    let minDiff = Infinity;

    svgPoints.completedPts.forEach((pt) => {
      const diff = Math.abs(pt.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = pt;
      }
    });

    setHoveredPoint(nearest);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
      
      {/* Header with Title & Legend Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              14-Day Delivery Velocity & Throughput
            </h3>
            <Tooltip content="Rolling 14-day delivery trajectory comparing task intake vs. resolution">
              <Info size={13} className="text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Continuous delivery rate: {totalCompleted14d} closed deliverables vs {totalCreated14d} opened units
          </p>
        </div>

        {/* Metric Toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/70 text-xs">
            <button
              type="button"
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none ${
                activeMetric === 'both'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Curves
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none ${
                activeMetric === 'completed'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Resolved ({totalCompleted14d})
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('created')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none ${
                activeMetric === 'created'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Intake ({totalCreated14d})
            </button>
          </div>

          <Tooltip content="Ratio of completed work to newly introduced backlog">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 font-medium cursor-help">
              Pace: <span className="text-emerald-700 font-bold">{momentumRatio}%</span>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
        className="relative w-full h-[220px] select-none cursor-crosshair overflow-hidden"
      >
        <svg
          role="img"
          aria-label="14-Day Delivery Velocity and Throughput Chart"
          viewBox={`0 0 ${svgPoints.width} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#10B981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#94A3B8" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Baseline Ticks */}
          {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = chartHeight - paddingBottom - pct * (chartHeight - paddingTop - paddingBottom);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgPoints.width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Area Fill: Created / Intake */}
          {(activeMetric === 'both' || activeMetric === 'created') && (
            <motion.path
              d={createdAreaPath}
              fill="url(#slateGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Area Fill: Resolved / Completed */}
          {(activeMetric === 'both' || activeMetric === 'completed') && (
            <motion.path
              d={completedAreaPath}
              fill="url(#emeraldGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Stroke Line: Created Intake Curve */}
          {(activeMetric === 'both' || activeMetric === 'created') && (
            <motion.path
              d={createdLinePath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Stroke Line: Resolved Output Curve */}
          {(activeMetric === 'both' || activeMetric === 'completed') && (
            <motion.path
              d={completedLinePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Bottom X-Axis Date Markers */}
          {svgPoints.completedPts.map((pt, idx) => {
            // Show every 2nd or 3rd date label to prevent crowding on small views
            const showLabel = idx % 2 === 0 || idx === svgPoints.completedPts.length - 1;
            if (!showLabel) return null;

            return (
              <text
                key={idx}
                x={pt.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-mono tracking-tighter"
              >
                {pt.data.displayDate}
              </text>
            );
          })}

          {/* Interactive Crosshair & Scrubbing Beacon */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={chartHeight - paddingBottom}
                stroke="#64748B"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />

              {/* Dot on Resolved curve */}
              {(activeMetric === 'both' || activeMetric === 'completed') && (
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="5"
                  className="fill-emerald-500 stroke-white stroke-2 shadow-md"
                />
              )}

              {/* Dot on Created curve */}
              {(activeMetric === 'both' || activeMetric === 'created') && (
                <circle
                  cx={hoveredPoint.x}
                  cy={
                    svgPoints.createdPts.find((p) => p.data.dateKey === hoveredPoint.data.dateKey)?.y ||
                    hoveredPoint.y
                  }
                  r="4"
                  className="fill-slate-500 stroke-white stroke-2 shadow-md"
                />
              )}
            </g>
          )}
        </svg>

        {/* Floating Scrubber HUD Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-2 pointer-events-none z-30 transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max(12, (hoveredPoint.x / svgPoints.width) * 100),
                88
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-2xl text-white text-xs flex flex-col gap-1 min-w-[130px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[10px] font-mono text-slate-400">
                <span>{hoveredPoint.data.dayName}</span>
                <span>{hoveredPoint.data.displayDate}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Resolved
                </span>
                <span className="font-mono font-bold">{hoveredPoint.data.completed}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Introduced
                </span>
                <span className="font-mono font-bold text-slate-300">{hoveredPoint.data.created}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics Row */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="font-medium text-slate-700">Closed Output Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-2xs" />
            <span className="font-medium text-slate-700">Backlog Intake Curve</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span>Continuous Sampling</span>
          <span>•</span>
          <span>Hover chart for day inspection</span>
        </div>
      </div>

    </div>
  );
};

export default ThroughputChart;
