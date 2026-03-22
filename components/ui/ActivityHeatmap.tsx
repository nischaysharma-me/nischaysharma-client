'use client';

import React, { useMemo } from 'react';
import { format, parseISO, isSameMonth, startOfMonth } from 'date-fns';

export interface ActivityDay {
  date: string | Date;
  count: number;
  level?: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
  title?: string;
  limitDays?: number;
  showLegend?: boolean;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
  data, 
  title = "Productivity Index", 
  limitDays = 371,
  showLegend = true
}) => {
  const processedData = useMemo(() => {
    // Take the last N days
    const slice = data.slice(-limitDays);
    
    // Process month labels
    const monthLabels: { label: string; span: number }[] = [];
    let currentMonth = '';
    let span = 0;

    slice.forEach((day, i) => {
      const date = typeof day.date === 'string' ? parseISO(day.date) : day.date;
      const month = format(date, 'MMM');
      
      if (i % 7 === 0) { // Check every new week column
        if (month !== currentMonth) {
          if (currentMonth !== '') {
            monthLabels.push({ label: currentMonth, span });
          }
          currentMonth = month;
          span = 1;
        } else {
          span++;
        }
      }
    });
    monthLabels.push({ label: currentMonth, span });

    return { slice, monthLabels };
  }, [data, limitDays]);

  const getColor = (count: number, level?: number) => {
    // Priority 1: Use count thresholds for high-contrast
    if (count === 0) return '#eee';
    if (count < 5) return 'rgba(0,0,0,0.15)';
    if (count < 10) return 'rgba(0,0,0,0.4)';
    if (count < 20) return 'rgba(0,0,0,0.7)';
    return '#000';
  };

  return (
    <div className="tc-heatmap">
      {title && <h3 className="tc-heatmap__title">{title}</h3>}
      
      <div className="tc-heatmap__wrapper">
        <div className="tc-heatmap__y-axis">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="tc-heatmap__main">
          <div className="tc-heatmap__x-axis">
            {processedData.monthLabels.map((m, i) => (
              <span key={i} style={{ minWidth: `${m.span * 16}px` }}>{m.label}</span>
            ))}
          </div>
          <div className="tc-heatmap__grid">
            {processedData.slice.map((day, i) => (
              <div 
                key={i}
                className="tc-heatmap__day"
                title={`${day.count} ${day.count === 1 ? 'Contribution' : 'Contributions'} on ${format(typeof day.date === 'string' ? parseISO(day.date) : day.date, 'MMMM do')}`}
                style={{ background: getColor(day.count, day.level) }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="tc-heatmap__footer">
        <span className="tc-heatmap__source">Real-time data synchronization</span>
        {showLegend && (
          <div className="tc-heatmap__legend">
            <span>Less</span>
            <div style={{ background: '#eee' }} />
            <div style={{ background: 'rgba(0,0,0,0.15)' }} />
            <div style={{ background: 'rgba(0,0,0,0.4)' }} />
            <div style={{ background: 'rgba(0,0,0,0.7)' }} />
            <div style={{ background: '#000' }} />
            <span>More</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
