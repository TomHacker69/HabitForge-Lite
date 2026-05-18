'use client';
import { useEffect, useState } from 'react';
import { format, subDays, addDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import styles from './logs.module.css';

export default function LogsPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ taskId: '', minutesSpent: 30, completed: false, notes: '' });

  useEffect(() => {
    fetch('/api/tasks').then((r) => r.json()).then((d) => setTasks(Array.isArray(d) ? d : []));
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(Array.isArray(d) ? d : []));
    fetch('/api/subcategories').then((r) => r.json()).then((d) => setSubcategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?date=${selectedDate}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditingLog(null);
    setForm({ taskId: tasks[0]?.id || '', minutesSpent: 30, completed: false, notes: '' });
    setShowModal(true);
  }

  function openEdit(log) {
    setEditingLog(log);
    setForm({ taskId: log.taskId, minutesSpent: log.minutesSpent, completed: log.completed, notes: log.notes || '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.taskId) return toast.error('Select a task');
    setSaving(true);
    try {
      if (editingLog) {
        await fetch('/api/logs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingLog.id, date: selectedDate, ...form }),
        });
        toast.success('Log updated');
      } else {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, date: selectedDate }),
        });
        toast.success('Log created');
      }
      setShowModal(false);
      await loadLogs();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this log entry?')) return;
    try {
      await fetch(`/api/logs?id=${id}&date=${selectedDate}`, { method: 'DELETE' });
      toast.success('Entry deleted');
      await loadLogs();
    } catch { toast.error('Failed to delete'); }
  }

  async function toggleCompleted(log) {
    try {
      await fetch('/api/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: log.id, date: selectedDate, completed: !log.completed }),
      });
      await loadLogs();
    } catch { toast.error('Failed to update'); }
  }

  const totalMinutes = logs.reduce((s, l) => s + (l.minutesSpent || 0), 0);
  const completedCount = logs.filter((l) => l.completed).length;

  function getTask(id) { return tasks.find((t) => t.id === id); }
  function getCategory(taskId) {
    const task = getTask(taskId);
    const sub = task ? subcategories.find((s) => s.id === task.subcategoryId) : null;
    return sub ? categories.find((c) => c.id === sub.categoryId) : null;
  }

  // Generate last 14 days for mini calendar
  const recentDays = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
    return date;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Logs</h1>
          <p className="page-subtitle">Track daily progress and session notes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-log-btn">+ Add Entry</button>
      </div>

      {/* Date Navigator */}
      <div className={`card ${styles.dateNav}`}>
        <button className="btn btn-ghost btn-icon" onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}>←</button>
        <div className={styles.miniCalendar}>
          {recentDays.map((d) => (
            <button
              key={d}
              className={`${styles.dayBtn} ${d === selectedDate ? styles.activeDay : ''} ${d === format(new Date(), 'yyyy-MM-dd') ? styles.today : ''}`}
              onClick={() => setSelectedDate(d)}
              title={d}
            >
              <span className={styles.dayNum}>{format(parseISO(d), 'd')}</span>
              <span className={styles.dayLabel}>{format(parseISO(d), 'EEE')}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => {
          const next = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
          if (next <= format(new Date(), 'yyyy-MM-dd')) setSelectedDate(next);
        }}>→</button>
        <div className={styles.selectedDate}>
          {format(parseISO(selectedDate), 'MMMM d, yyyy')}
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Entries</div>
          <div className="stat-value">{logs.length}</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Focus Time</div>
          <div className="stat-value">{totalMinutes < 60 ? `${totalMinutes}m` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedCount}</div>
        </div>
      </div>

      {/* Logs */}
      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" style={{ width: 28, height: 28 }} /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No entries for this day</p>
          <p className="empty-state-description">Add a log entry or use the timer to record sessions.</p>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>+ Add Entry</button>
        </div>
      ) : (
        <div className={styles.logList}>
          {logs.map((log) => {
            const task = getTask(log.taskId);
            const cat = getCategory(log.taskId);
            return (
              <div key={log.id} className={`${styles.logCard} ${log.completed ? styles.logCompleted : ''}`}>
                <button
                  className={`${styles.checkBtn} ${log.completed ? styles.checked : ''}`}
                  onClick={() => toggleCompleted(log)}
                  title="Toggle completion"
                >
                  {log.completed ? '✓' : '○'}
                </button>
                <div className={styles.logInfo}>
                  <div className={styles.logTask}>{task?.title || 'Unknown Task'}</div>
                  {cat && (
                    <div className={styles.logCat} style={{ color: cat.color }}>
                      {cat.icon} {cat.name}
                    </div>
                  )}
                  {log.notes && <div className={styles.logNotes}>"{log.notes}"</div>}
                </div>
                <div className={styles.logRight}>
                  <div className={styles.logTime}>{log.minutesSpent}m</div>
                  {log.completed && <span className="badge badge-green">Done</span>}
                </div>
                <div className={styles.logActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(log)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(log.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingLog ? 'Edit Entry' : 'New Log Entry'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task</label>
                <select className="form-select" value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} id="log-task-select">
                  <option value="">Select task...</option>
                  {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Minutes Spent</label>
                  <input className="form-input" type="number" min={1} value={form.minutesSpent} onChange={(e) => setForm({ ...form, minutesSpent: parseInt(e.target.value) || 0 })} id="log-minutes-input" />
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label className={styles.completedCheck}>
                    <input type="checkbox" checked={form.completed} onChange={(e) => setForm({ ...form, completed: e.target.checked })} />
                    Mark as completed
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" placeholder="What did you accomplish?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-log-btn">
                {saving ? 'Saving...' : editingLog ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
