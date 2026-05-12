import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Search, Trash2, AlertCircle, Moon, Sun, ChevronDown, Loader2, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LocalTask } from '../lib/storage';
import { cn } from '../lib/utils';
import { safeGroq } from '../lib/groq';

const TaskBoard: React.FC = () => {
  const { appData, updateAppData, addUserXp } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMoveTask, setMobileMoveTask] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as LocalTask['priority'],
    status: 'todo' as LocalTask['status'],
  });

  const tasks = appData.tasks;

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < today).map(t => t.id);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [tasks, searchQuery]);

  const handleSuggestSubtasks = useCallback(async () => {
    if (!newTask.title.trim() || suggestLoading) return;
    setSuggestLoading(true);
    const result = await safeGroq(
      'You are a productivity assistant. Break the given task into 3-4 specific subtasks. Return ONLY a JSON array of strings, nothing else.',
      `Task: "${newTask.title}"${newTask.description ? ` Description: "${newTask.description}"` : ''}`,
      'mixtral-8x7b-32768',
      '["Research the topic", "Outline key points", "Write first draft", "Review and revise"]',
    );
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) setSuggestions(parsed.slice(0, 4));
      else setSuggestions(['Research', 'Outline', 'Draft', 'Review']);
    } catch {
      setSuggestions(['Research', 'Outline', 'Draft', 'Review']);
    }
    setSuggestLoading(false);
  }, [newTask, suggestLoading]);

  const handleAddTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }
    const task: LocalTask = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: newTask.status,
      createdAt: Date.now(),
    };
    updateAppData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
    setIsAdding(false);
    setNewTask({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0], priority: 'medium', status: 'todo' });
  }, [newTask, updateAppData]);

  const handleDeleteTask = useCallback((id: string) => {
    updateAppData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    setConfirmDelete(null);
  }, [updateAppData]);

  const handleMoveTask = useCallback((id: string, newStatus: LocalTask['status']) => {
    updateAppData(prev => {
      const updated = prev.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
      const task = prev.tasks.find(t => t.id === id);
      if (task && task.status !== 'done' && newStatus === 'done') {
        addUserXp(25);
      }
      return { ...prev, tasks: updated };
    });
    setMobileMoveTask(null);
  }, [updateAppData, addUserXp]);

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    handleMoveTask(draggableId, destination.droppableId as LocalTask['status']);
  }, [handleMoveTask]);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary/5');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/5');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, status: LocalTask['status']) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/5');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) handleMoveTask(taskId, status);
  }, [handleMoveTask]);

  const columns: { id: LocalTask['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col max-w-full overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Task Management</h1>
          <p className="text-sm text-slate-500">Organize your academic goals with ease.</p>
        </div>
        <button onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto">
          <Plus size={18} /> New Task
        </button>
      </header>

      <div className="flex items-center gap-3 glass p-3 sm:p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search tasks..."
            className="w-full pl-10 sm:pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 flex-1 overflow-hidden">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-3 sm:p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  {col.title}
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{colTasks.length}</span>
                </h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto min-h-[120px]">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs text-center p-4">
                    <div className="text-2xl mb-2 opacity-30">
                      {col.id === 'todo' ? '\u2610' : col.id === 'in-progress' ? '\u23F3' : '\u2714\uFE0F'}
                    </div>
                    <p className="font-medium">No tasks here</p>
                    <p className="text-[10px] mt-1">{col.id === 'todo' ? 'Add a new task to get started' : col.id === 'in-progress' ? 'Move tasks from To Do' : 'Complete tasks to see them here'}</p>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={cn(
                        "glass p-3 sm:p-4 rounded-xl shadow-sm border-l-4 transition-all cursor-grab active:cursor-grabbing hover:translate-y-[-1px]",
                        task.priority === 'high' ? "border-l-red-500" :
                        task.priority === 'medium' ? "border-l-blue-500" : "border-l-slate-300",
                        overdueTasks.includes(task.id) && "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
                      )}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{task.priority}</span>
                        <div className="flex gap-1">
                          {task.status !== 'done' && (
                            <div className="relative">
                              <button onClick={() => setMobileMoveTask(mobileMoveTask === task.id ? null : task.id)}
                                className="p-1.5 text-slate-300 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center md:hidden">
                                <ChevronDown size={14} />
                              </button>
                              {mobileMoveTask === task.id && (
                                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[130px]">
                                  {columns.filter(c => c.id !== task.status).map(c => (
                                    <button key={c.id} onClick={() => handleMoveTask(task.id, c.id)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                      Move to {c.title}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {confirmDelete === task.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDeleteTask(task.id)}
                                className="text-xs font-bold text-red-500 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">Delete</button>
                              <button onClick={() => setConfirmDelete(null)}
                                className="text-xs font-bold text-slate-400 px-2 py-1 rounded hover:bg-slate-100 transition-colors">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(task.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 min-w-[36px] min-h-[36px] flex items-center justify-center">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 mb-1">{task.title}</h4>
                      {task.description && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>}
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mt-2">
                        <div className="flex items-center gap-1">
                          {overdueTasks.includes(task.id) ? <AlertCircle size={12} className="text-red-500" /> : <Sun size={12} />}
                          <span className={overdueTasks.includes(task.id) ? 'text-red-500 font-bold' : ''}>{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl sm:text-2xl font-bold mb-5 text-slate-800 dark:text-white">Create New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-3 sm:space-y-4">
              <input type="text" placeholder="Task Title" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              <textarea placeholder="Description (optional)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary h-20 resize-none text-base"
                value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                  value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input type="date" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary text-base"
                  value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
              </div>
              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

              {newTask.title.trim().length > 2 && !suggestions && (
                <button type="button" onClick={handleSuggestSubtasks} disabled={suggestLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/40 text-xs font-bold text-primary hover:bg-primary/5 transition-all min-h-[44px]">
                  {suggestLoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                  {suggestLoading ? 'Thinking...' : 'Suggest Subtasks with AI'}
                </button>
              )}

              {suggestions && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Suggested Subtasks</p>
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                  <button type="button" onClick={() => setSuggestions(null)}
                    className="text-[10px] text-slate-400 hover:text-primary mt-1">Dismiss</button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsAdding(false); setError(''); setSuggestions(null); }}
                  className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 btn-primary text-sm">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
