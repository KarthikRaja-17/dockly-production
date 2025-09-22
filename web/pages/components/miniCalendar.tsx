'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const COLORS = {
    primary: '#1C1C1E',
    secondary: '#48484A',
    accent: "#6366F1",
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9F9FB',
    border: '#E5E5EA',
    borderLight: '#F1F1F5',
    text: '#1C1C1E',
    textSecondary: '#6D6D80',
    textTertiary: '#8E8E93',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadowLight: 'rgba(0, 0, 0, 0.03)',
    shadowMedium: 'rgba(0, 0, 0, 0.06)',
};

const SPACING = {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
};

interface Event {
    id: string;
    title: string;
    startTime: string;
    date: string;
    person: string;
    color: string;
}

interface MiniCalendarProps {
    currentDate?: Date;
    onDateSelect: (date: Date) => void;
    events?: Event[];
    view: 'Day' | 'Week' | 'Month' | 'Year';
    onMonthChange?: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
    currentDate = new Date(),
    onDateSelect,
    events = [],
    view,
    onMonthChange,
}) => {
    const [displayDate, setDisplayDate] = useState<Date>(new Date(currentDate));

    useEffect(() => {
        setDisplayDate(new Date(currentDate));
    }, [currentDate]);

    const formatDateString = (date: Date) =>
        `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
            .getDate()
            .toString()
            .padStart(2, '0')}`;

    const getMonthDays = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        const current = new Date(startDate);

        while (current <= lastDay || current.getDay() !== 0 || days.length < 35) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const monthDays = getMonthDays(displayDate);
    const totalRows = Math.ceil(monthDays.length / 7);
    const cellHeight = Math.floor((260 - 60) / totalRows);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setDisplayDate(newDate);
        onMonthChange?.(newDate);
    };

    const getEventsForDate = (date: Date) =>
        events.filter(event => event.date === formatDateString(date));

    const isCurrentMonth = (date: Date) => date.getMonth() === displayDate.getMonth();
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date: Date) =>
        currentDate && date.toDateString() === currentDate.toDateString();
    const isPastDate = (date: Date) => date < new Date() && !isToday(date);

    return (
        <div
            style={{
                background: COLORS.surface,
                borderRadius: 12,
                padding: SPACING.lg,
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: `0 1px 4px ${COLORS.shadowLight}`,
                maxWidth: 420,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: 12,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SPACING.md,
                }}
            >
                <button
                    onClick={() => navigateMonth('prev')}
                    style={{ ...navBtnStyle }}
                    aria-label="Previous month"
                >
                    <ChevronLeft size={14} />
                </button>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <Calendar size={14} />
                    {displayDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <button
                    onClick={() => navigateMonth('next')}
                    style={{ ...navBtnStyle }}
                    aria-label="Next month"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Weekdays */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    textAlign: 'center',
                    fontWeight: 500,
                    color: COLORS.textSecondary,
                    marginBottom: SPACING.sm,
                }}
            >
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} style={{ color: i === 0 || i === 6 ? COLORS.accent : COLORS.textSecondary }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 2,
                }}
            >
                {monthDays.map((date, idx) => {
                    const eventsToday = getEventsForDate(date);
                    const isCurrent = isCurrentMonth(date);
                    const selected = isSelected(date);
                    const today = isToday(date);
                    const past = isPastDate(date);

                    return (
                        <div
                            key={idx}
                            onClick={() => isCurrent && onDateSelect(date)}
                            style={{
                                position: 'relative',
                                height: `${cellHeight}px`,
                                borderRadius: 6,
                                fontWeight: today ? 600 : 400,
                                textAlign: 'center',
                                lineHeight: `${cellHeight}px`,
                                cursor: isCurrent ? 'pointer' : 'default',
                                background: selected
                                    ? COLORS.accent
                                    : today
                                        ? `${COLORS.accent}10`
                                        : 'transparent',
                                color: selected
                                    ? '#fff'
                                    : today
                                        ? COLORS.accent
                                        : past
                                            ? COLORS.textTertiary
                                            : isCurrent
                                                ? COLORS.text
                                                : COLORS.textTertiary,
                                border: today && !selected ? `1px solid ${COLORS.accent}` : 'none',
                                transition: 'all 0.2s ease-in-out',
                            }}
                            onMouseEnter={(e) => {
                                if (isCurrent && !past && !selected) {
                                    (e.currentTarget as HTMLDivElement).style.background = COLORS.surfaceSecondary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isCurrent && !past && !selected) {
                                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                                }
                            }}
                        >
                            {date.getDate()}
                            {eventsToday.length > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 3,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {eventsToday.slice(0, 3).map((event, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: 3,
                                                height: 3,
                                                borderRadius: '50%',
                                                backgroundColor: selected ? '#fff' : event.color || COLORS.accent,
                                                opacity: 0.9,
                                            }}
                                        />
                                    ))}
                                    {eventsToday.length > 3 && (
                                        <div
                                            style={{
                                                width: 3,
                                                height: 3,
                                                borderRadius: '50%',
                                                backgroundColor: COLORS.textSecondary,
                                                opacity: 0.7,
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const navBtnStyle: React.CSSProperties = {
    padding: '4px 6px',
    borderRadius: 6,
    background: '#F1F1F5',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
};

export default MiniCalendar;
