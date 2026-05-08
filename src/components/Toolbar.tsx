import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, Trash, FolderOpen, Check, X } from 'lucide-react';

export function Toolbar() {
  const { clearProject, saveCurrentProject, savedProjects, loadSavedProject, deleteSavedProject, width, length, height, setDimensions } = useStore();
  const [showProjects, setShowProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState('Новый проект');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <header className="toolbar">
      <div className="toolbar-logo-container">
        <div className="toolbar-logo-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <span className="toolbar-title">RoomStudio <span>3D</span></span>
      </div>

      <div className="toolbar-actions">
        <div className="dimensions-group">
          <label className="dimension-label">
            Ширина (м)
            <input 
              type="number" 
              value={width}
              onChange={(e) => setDimensions(Number(e.target.value), length, height)}
              className="dimension-input" 
              min="2" max="20"
            />
          </label>
          <span className="dimension-divider">×</span>
          <label className="dimension-label">
            Длина (м)
            <input 
              type="number" 
              value={length}
              onChange={(e) => setDimensions(width, Number(e.target.value), height)}
              className="dimension-input" 
              min="2" max="20"
            />
          </label>
        </div>

        <div className="divider-vertical"></div>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProjects(!showProjects)}
            className="btn-icon-text"
          >
            <FolderOpen className="action-icon" />
            Проекты
          </button>

          {showProjects && (
            <div className="projects-dropdown">
              <div className="projects-header">
                Мои проекты
              </div>
              <div className="projects-list">
                {savedProjects.length === 0 && (
                  <div className="project-empty">Нет сохраненных проектов</div>
                )}
                {savedProjects.map(p => (
                  <div key={p.id} className="project-item">
                    <button 
                      onClick={() => { loadSavedProject(p.id); setShowProjects(false); }}
                      className="project-item-btn"
                    >
                      {p.name}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDeleteId === p.id) {
                          deleteSavedProject(p.id);
                          setConfirmDeleteId(null);
                        } else {
                          setConfirmDeleteId(p.id);
                        }
                      }}
                      className={`project-delete-btn ${confirmDeleteId === p.id ? 'confirm' : ''}`}
                      title={confirmDeleteId === p.id ? "Подтвердить удаление" : "Удалить проект"}
                    >
                      {confirmDeleteId === p.id ? 'Удалить?' : <Trash className="action-icon" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="divider-vertical"></div>
        
        <button 
          onClick={clearProject}
          className="btn-icon-text"
        >
          <Trash className="action-icon" />
          Очистить
        </button>

        {isSaving ? (
          <div className="save-input-group">
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="save-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) {
                  saveCurrentProject(projectName.trim());
                  setIsSaving(false);
                } else if (e.key === 'Escape') {
                  setIsSaving(false);
                }
              }}
            />
            <button 
              onClick={() => {
                if (projectName.trim()) {
                  saveCurrentProject(projectName.trim());
                  setIsSaving(false);
                }
              }}
              className="save-action-btn confirm"
            >
              <Check className="action-icon" />
            </button>
            <button 
              onClick={() => setIsSaving(false)}
              className="save-action-btn cancel"
            >
              <X className="action-icon" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsSaving(true)}
            className="btn-primary"
          >
            <Save className="action-icon" />
            Сохранить проект
          </button>
        )}
      </div>
    </header>
  );
}
