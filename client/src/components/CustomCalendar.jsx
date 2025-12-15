import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomCalendar = ({ value, onChange, minDate, className = "" }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Synchronize current month with selected date on open
    useEffect(() => {
        if (isOpen && value) {
            setCurrentMonth(new Date(value));
        }
    }, [isOpen, value]);

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;
            // Position at the TOP of the input (minus gap)
            setPosition({
                top: rect.top + scrollY - 8,
                left: rect.left + scrollX
            });
        }
    };

    // Handle scroll/resize to update position
    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is inside the portal content
            const dropdown = document.getElementById('calendar-portal-dropdown');
            if (dropdown && dropdown.contains(event.target)) {
                return;
            }
            // Check if click is inside the trigger button
            if (containerRef.current && containerRef.current.contains(event.target)) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleOpen = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            updatePosition(); // Calculate position immediately before opening
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const nextMonth = (e) => {
        e.stopPropagation();
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = (e) => {
        e.stopPropagation();
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const onDateClick = (day, e) => {
        e.stopPropagation();
        if (minDate && isBefore(day, startOfDay(new Date(minDate)))) return;

        onChange(day);
        setIsOpen(false);
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-2 px-1" onClick={(e) => e.stopPropagation()}>
                <span className="text-gray-900 font-bold text-sm">
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <div className="flex gap-1">
                    <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition">
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEEEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide py-1">
                    {format(new Date(startDate.setDate(startDate.getDate() + i)), dateFormat)}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2 border-b border-gray-100">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isDisabled = minDate && isBefore(day, startOfDay(new Date(minDate)));
                const isSelected = value && isSameDay(day, new Date(value));
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day}
                        className={`p-1 relative aspect-square flex items-center justify-center`}
                        onClick={(e) => !isDisabled && onDateClick(cloneDay, e)}
                    >
                        <div
                            className={`
                                w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all relative z-10
                                ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-green-50 text-gray-700'}
                                ${isSelected ? '!bg-primary !text-white shadow-md shadow-green-200' : ''}
                                ${!isCurrentMonth && !isDisabled ? 'text-gray-400' : ''}
                            `}
                        >
                            {formattedDate}
                        </div>
                    </div>
                );
                day = new Date(day.setDate(day.getDate() + 1));
            }
            rows.push(
                <div className="grid grid-cols-7" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };

    // Calculate style for portal
    const portalStyle = {
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 40, // Scroll behind Navbar (z-50)
        transformOrigin: 'bottom left' // Animate from the bottom
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={toggleOpen}
                className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-sm font-medium bg-white
                    ${isOpen ? 'border-primary ring-4 ring-primary/10' : 'border-gray-200 hover:border-primary'}
                `}
            >
                <div className="flex items-center gap-2 text-gray-900">
                    <CalendarIcon size={16} className={`${isOpen ? 'text-primary' : 'text-gray-400'}`} />
                    <span>{value ? format(new Date(value), 'MMM dd, yyyy') : 'Select Date'}</span>
                </div>
            </button>

            {/* Calendar Popover via Portal */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id="calendar-portal-dropdown"
                            initial={{ opacity: 0, scale: 0.95, y: 'calc(-100% + 10px)' }} // Start slightly lower than final position (upwards animation)
                            animate={{ opacity: 1, scale: 1, y: '-100%' }} // Final position: shifted fully up
                            exit={{ opacity: 0, scale: 0.95, y: 'calc(-100% + 10px)' }}
                            transition={{ duration: 0.15 }}
                            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 w-[260px]"
                            style={portalStyle}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {renderHeader()}
                            {renderDays()}
                            {renderCells()}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CustomCalendar;
