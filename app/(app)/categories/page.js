'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './categories.module.css';

const ICONS = ['📁', '💻', '📚', '🎨', '💪', '🍎', '🎯', '🏆', '🌟', '💡', '🔬', '🎵', '✍️', '🧘', '🚀', '💰'];
const COLORS = [
  '#febfca', '#f87171', '#fbbf24', '#6ee7b7', '#60a5fa', '#a78bfa',
  '#fb923c', '#34d399', '#818cf8', '#f472b6', '#2dd4bf', '#e879f9',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#febfca', icon: '📁' });
  const [subForm, setSubForm] = useState({ name: '', categoryId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cats, subs, tsks] = await Promise.all([
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/subcategories').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setSubcategories(Array.isArray(subs) ? subs : []);
      setTasks(Array.isArray(tsks) ? tsks : []);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditing(null);
    setForm({ name: '', color: '#febfca', icon: '📁' });
    setShowModal(true);
  }

  function openEditModal(cat) {
    setEditing(cat);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon });
    setShowModal(true);
  }

  function openSubModal(categoryId) {
    setEditingSub(null);
    setSubForm({ name: '', categoryId });
    setSelectedCategoryId(categoryId);
    setShowSubModal(true);
  }

  function openEditSubModal(sub) {
    setEditingSub(sub);
    setSubForm({ name: sub.name, categoryId: sub.categoryId });
    setShowSubModal(true);
  }

  async function handleSaveCategory() {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Category updated');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Category created');
      }
      setShowModal(false);
      await loadData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this category and all its subcategories and tasks?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      await loadData();
    } catch {
      toast.error('Failed to delete');
    }
  }

  async function handleSaveSub() {
    if (!subForm.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editingSub) {
        await fetch(`/api/subcategories/${editingSub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subForm),
        });
        toast.success('Subcategory updated');
      } else {
        await fetch('/api/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subForm),
        });
        toast.success('Subcategory created');
      }
      setShowSubModal(false);
      await loadData();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSub(id) {
    if (!confirm('Delete this subcategory and all its tasks?')) return;
    try {
      await fetch(`/api/subcategories/${id}`, { method: 'DELETE' });
      toast.success('Subcategory deleted');
      await loadData();
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-overlay"><div className="loading-spinner" style={{ width: 32, height: 32 }} /></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories, {subcategories.length} subcategories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} id="create-category-btn">
          + New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <p className="empty-state-title">No categories yet</p>
          <p className="empty-state-description">Create your first category to organize your tasks.</p>
          <button className="btn btn-primary" onClick={openCreateModal} style={{ marginTop: 16 }}>
            + Create Category
          </button>
        </div>
      ) : (
        <div className={styles.catGrid}>
          {categories.map((cat) => {
            const catSubs = subcategories.filter((s) => s.categoryId === cat.id);
            const catTaskCount = tasks.filter((t) =>
              catSubs.some((s) => s.id === t.subcategoryId)
            ).length;

            return (
              <div key={cat.id} className={styles.catCard}>
                <div className={styles.catHeader}>
                  <div className={styles.catIcon} style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                    <span>{cat.icon}</span>
                  </div>
                  <div className={styles.catInfo}>
                    <div className={styles.catName}>{cat.name}</div>
                    <div className={styles.catMeta}>
                      {catSubs.length} subcategories · {catTaskCount} tasks
                    </div>
                  </div>
                  <div className={styles.catColor} style={{ background: cat.color }} />
                </div>
                <div className={styles.catActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(cat)}>✏️ Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openSubModal(cat.id)}>+ Sub</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(cat.id)}>🗑️</button>
                </div>
                {catSubs.length > 0 && (
                  <div className={styles.subList}>
                    {catSubs.map((sub) => {
                      const subTaskCount = tasks.filter((t) => t.subcategoryId === sub.id).length;
                      return (
                        <div key={sub.id} className={styles.subItem}>
                          <div className={styles.subDot} style={{ background: cat.color }} />
                          <span className={styles.subName}>{sub.name}</span>
                          <span className={styles.subCount}>{subTaskCount} tasks</span>
                          <div className={styles.subActions}>
                            <button className={styles.iconBtn} onClick={() => openEditSubModal(sub)} title="Edit">✏️</button>
                            <button className={styles.iconBtn} onClick={() => handleDeleteSub(sub.id)} title="Delete">🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  placeholder="e.g., Work, Health, Learning"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                  id="cat-name-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div className={styles.iconGrid}>
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      className={`${styles.iconOption} ${form.icon === icon ? styles.selected : ''}`}
                      onClick={() => setForm({ ...form, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div className={styles.colorGrid}>
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`${styles.colorOption} ${form.color === color ? styles.colorSelected : ''}`}
                      style={{ background: color }}
                      onClick={() => setForm({ ...form, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCategory} disabled={saving} id="save-category-btn">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSubModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingSub ? 'Edit Subcategory' : 'New Subcategory'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowSubModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select
                  className="form-select"
                  value={subForm.categoryId}
                  onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  placeholder="e.g., Frontend, Exercise, Reading"
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  autoFocus
                  id="sub-name-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSubModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSub} disabled={saving} id="save-sub-btn">
                {saving ? 'Saving...' : editingSub ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
