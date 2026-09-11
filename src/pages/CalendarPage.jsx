import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function CalendarPage() {
  const { tasks, openEditTaskModal } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueAt) return;
      const d = new Date(t.dueAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(t);
      }
    });
    return map;
  }, [tasks, year, month]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Calendar Header */}
      <div className="glass-panel p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--outline)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>
              {monthNames[month]} {year}
            </h1>
            <p className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Calendario de entregas Galileo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ 
              backgroundColor: 'var(--surface-variant)',
              color: 'var(--on-surface)',
              borderColor: 'var(--outline)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            Hoy
          </button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl transition-all"
            style={{ 
              backgroundColor: 'var(--surface-variant)',
              color: 'var(--on-surface)',
              borderColor: 'var(--outline)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl transition-all"
            style={{ 
              backgroundColor: 'var(--surface-variant)',
              color: 'var(--on-surface)',
              borderColor: 'var(--outline)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border overflow-x-auto" style={{ borderColor: 'var(--outline)' }}>
        <div className="min-w-[640px]">

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>
            <div>Dom</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="h-28 rounded-2xl border opacity-40" style={{ 
                backgroundColor: 'var(--surface-variant)',
                borderColor: 'var(--outline-variant)'
              }}></div>
            ))}

            {daysArray.map((day) => {
              const dayTasks = tasksByDay[day] || [];
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`h-32 p-2 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isToday
                      ? ''
                      : ''
                  }`}
                  style={isToday ? { 
                    backgroundColor: 'var(--primary)08',
                    borderColor: 'var(--primary)50',
                    boxShadow: '0 10px 25px -5px var(--primary)30'
                  } : { 
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--outline-variant)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? '' : ''
                      }`}
                      style={isToday ? { 
                        backgroundColor: 'var(--primary)',
                        color: 'var(--on-primary)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      } : { 
                        color: 'var(--on-surface-variant)'
                      }}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border" style={{ 
                        backgroundColor: 'var(--surface-variant)',
                        color: 'var(--primary)',
                        borderColor: 'var(--outline)'
                      }}>
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks List snippet */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-20 no-scrollbar">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openEditTaskModal(t)}
                        className={`p-1 px-1.5 rounded-lg text-[10px] font-semibold truncate cursor-pointer transition-transform hover:scale-95 ${
                          t.done
                            ? 'border'
                            : t.priority === 3
                            ? 'border'
                            : 'border'
                        }`}
                        style={t.done ? { 
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          color: '#10b981',
                          borderColor: 'rgba(16, 185, 129, 0.2)'
                        } : t.priority === 3 ? { 
                          backgroundColor: 'rgba(244, 63, 94, 0.05)',
                          color: '#f43f5e',
                          borderColor: 'rgba(244, 63, 94, 0.2)'
                        } : { 
                          backgroundColor: 'var(--primary)10',
                          color: 'var(--primary)',
                          borderColor: 'var(--primary)20'
                        }}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}