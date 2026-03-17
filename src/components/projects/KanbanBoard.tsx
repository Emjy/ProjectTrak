'use client';

import { useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import KanbanCard from './KanbanCard';

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'todo',        label: 'À faire',    color: 'text-slate-700',   bg: 'bg-slate-50',       dot: 'bg-slate-400'   },
  { id: 'in-progress', label: 'En cours',   color: 'text-indigo-700',  bg: 'bg-indigo-50/60',   dot: 'bg-indigo-500'  },
  { id: 'done',        label: 'Terminées',  color: 'text-emerald-700', bg: 'bg-emerald-50/60',  dot: 'bg-emerald-500' },
];

function DroppableColumn({ column, tasks, onView, onEdit, onDelete }: {
  column: typeof COLUMNS[0];
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { users } = useApp();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className={`flex flex-col rounded-2xl ${column.bg} border ${isOver ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200/80'} transition-all min-h-0`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/60 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${column.dot}`} />
        <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
        <span className="ml-auto text-xs font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          {tasks.length}
        </span>
      </div>

      {/* Scrollable cards area */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              users={users}
              onView={() => onView(task)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            Glisser ici
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onAddTask: () => void;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onViewTask, onEditTask, onDeleteTask }: KanbanBoardProps) {
  const { updateTask, users } = useApp();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = COLUMNS.find(c => c.id === overId);
    if (targetColumn) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetColumn.id) updateTask(taskId, { status: targetColumn.id });
      return;
    }

    const targetTask = tasks.find(t => t.id === overId);
    if (targetTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetTask.status) updateTask(taskId, { status: targetTask.status });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Horizontally scrollable on mobile, fixed-height grid on desktop */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
      <div className="grid grid-cols-3 gap-3 md:gap-4 min-w-[680px]" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
        {COLUMNS.map(col => (
          <DroppableColumn
            key={col.id}
            column={col}
            tasks={tasks.filter(t => t.status === col.id)}
            onView={onViewTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 scale-105">
            <KanbanCard task={activeTask} users={users} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
