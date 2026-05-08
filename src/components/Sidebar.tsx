import React, { useState, useEffect, useCallback } from 'react';
import { useStore, FurnitureType } from '../store/useStore';
import { 
  Plus, Square, LayoutTemplate, 
  Trash2, X, RotateCw, Menu, ChevronRight
} from 'lucide-react';

const COLORS = ['#ffffff', '#e5e7eb', '#9ca3af', '#4b5563', '#1f2937', '#fecaca', '#fca5a5', '#bbf7d0', '#bfdbfe', '#fef08a'];

const brickSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#cc7755"/><path d="M0,50 H100 M50,0 V50 M100,50 V100" stroke="#aa5533" stroke-width="4"/><path d="M0,0 H100" stroke="#aa5533" stroke-width="4"/></svg>`;
const woodSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#cda87c"/><path d="M0,20 Q50,25 100,20 M0,40 Q50,45 100,40 M0,60 Q50,65 100,60 M0,80 Q50,85 100,80 M0,100 H100 M0,0 H100" stroke="#a07548" fill="none" stroke-width="3"/></svg>`;
const tileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f8f9fa"/><rect x="0" y="0" width="50" height="50" fill="#e9ecef"/><rect x="50" y="50" width="50" height="50" fill="#e9ecef"/></svg>`;
const wallpaperSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#eef2ff"/><circle cx="50" cy="50" r="20" stroke="#c7d2fe" fill="none" stroke-width="4"/><circle cx="0" cy="0" r="20" stroke="#c7d2fe" fill="none" stroke-width="4"/><circle cx="100" cy="100" r="20" stroke="#c7d2fe" fill="none" stroke-width="4"/><circle cx="100" cy="0" r="20" stroke="#c7d2fe" fill="none" stroke-width="4"/><circle cx="0" cy="100" r="20" stroke="#c7d2fe" fill="none" stroke-width="4"/></svg>`;

const toDataURL = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

const TEXTURES = [
  { label: 'Цвет', url: '' },
  { label: 'Кирпич', url: toDataURL(brickSvg) },
  { label: 'Дерево', url: toDataURL(woodSvg) },
  { label: 'Плитка', url: toDataURL(tileSvg) },
  { label: 'Обои', url: toDataURL(wallpaperSvg) }
];

function DebouncedColorPicker({ value, onChange, className }: { value: string; onChange: (c: string) => void; className?: string }) {
  const [localColor, setLocalColor] = useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalColor(value);
  }, [value]);

  return (
    <input 
      type="color" 
      value={localColor}
      onChange={(e) => {
        const val = e.target.value;
        setLocalColor(val);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          onChange(val);
        }, 50); // fast enough to feel instant, slow enough to not crash WebGL
      }}
      className={className}
    />
  );
}

export function Sidebar() {
  const { 
    selectedId, selectedType, setSelection, 
    addFurniture, walls, updateWall, 
    addWindow, updateFurniture, removeFurniture, removeWindow, furniture,
    floorColor, floorTexture, setFloorColor, setFloorTexture
  } = useStore();

  return (
    <aside className="sidebar">
      {!selectedId && (
        <div className="panel-section">
          <div>
            <h3 className="section-title">Мебель</h3>
            <div className="furniture-grid">
              {[
                { type: 'chair', label: 'Стул' },
                { type: 'table', label: 'Стол' },
                { type: 'armchair', label: 'Кресло' },
                { type: 'sofa', label: 'Диван' },
                { type: 'bed', label: 'Кровать' },
                { type: 'cabinet', label: 'Шкаф' },
                { type: 'tv_stand', label: 'Тумба ТВ' },
                { type: 'tv', label: 'Телевизор' },
                { type: 'desk', label: 'Комп. стол' },
                { type: 'office_chair', label: 'Офисное кресло' },
                { type: 'plant', label: 'Растение' },
                { type: 'lamp', label: 'Лампа' },
                { type: 'carpet', label: 'Ковер' },
                { type: 'bookshelf', label: 'Книж. шкаф' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addFurniture(item.type as FurnitureType)}
                  className="furniture-item-btn"
                >
                  <Plus className="furniture-icon" />
                  <span className="furniture-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="info-box">
            <p>Выберите стену, чтобы изменить цвет или добавить окна.</p>
          </div>
        </div>
      )}

      {selectedType === 'wall' && (
        <div className="panel-section-space">
          <div className="panel-header">
            <div>
              <h3 className="section-title small-margin">Редактор стены</h3>
              <p className="panel-subtitle">Индекс: {selectedId}</p>
            </div>
            <button onClick={() => setSelection(null, null)} className="close-btn">
              Закрыть
            </button>
          </div>

          <div>
            <h4 className="section-title small-margin">Материал</h4>
            <div className="texture-grid">
              {TEXTURES.map((tex) => (
                <button
                  key={tex.label}
                  onClick={() => updateWall(parseInt(selectedId!), { texture: tex.url })}
                  className={`texture-btn ${
                    (walls[parseInt(selectedId!)].texture || '') === tex.url
                      ? 'active'
                      : 'inactive'
                  }`}
                >
                  {tex.label}
                </button>
              ))}
            </div>

            <h4 className="section-title mt">Цвет</h4>
            <div className="color-picker-container">
              <DebouncedColorPicker 
                value={walls[parseInt(selectedId!)].color}
                onChange={(c) => updateWall(parseInt(selectedId!), { color: c })}
                className="color-input"
              />
            </div>
          </div>

          <div>
            <h4 className="section-title mt">Элементы</h4>
            <div className="elements-grid">
              <button 
                onClick={() => addWindow(parseInt(selectedId!), 'normal')}
                className="element-btn"
              >
                <Square className="element-icon" />
                <span className="element-label">Обычное<br/>Окно</span>
              </button>
              <button 
                onClick={() => addWindow(parseInt(selectedId!), 'panoramic')}
                className="element-btn"
              >
                <LayoutTemplate className="element-icon" />
                <span className="element-label">Панорамное<br/>Окно</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedType === 'floor' && (
        <div className="panel-section-space">
          <div className="panel-header">
            <div>
              <h3 className="section-title small-margin">Редактор пола</h3>
            </div>
            <button onClick={() => setSelection(null, null)} className="close-btn">
              Закрыть
            </button>
          </div>

          <div>
            <h4 className="section-title small-margin">Текстура</h4>
            <div className="texture-grid">
              {TEXTURES.map((tex) => (
                <button
                  key={tex.label}
                  onClick={() => setFloorTexture(tex.url)}
                  className={`texture-btn ${
                    (floorTexture || '') === tex.url
                      ? 'active'
                      : 'inactive'
                  }`}
                >
                  {tex.label}
                </button>
              ))}
            </div>

            <h4 className="section-title mt">Цвет</h4>
            <div className="color-picker-container">
              <DebouncedColorPicker 
                value={floorColor}
                onChange={(c) => setFloorColor(c)}
                className="color-input"
              />
            </div>
          </div>
        </div>
      )}

      {selectedType === 'furniture' && (
        <div className="panel-section-space">
          <div className="panel-header">
            <h3 className="section-title flex-col">
              Настройки Мебели
              <span className="element-highlight">
                {furniture.find(f => f.id === selectedId)?.type || 'Объект'}
              </span>
            </h3>
            <button onClick={() => setSelection(null, null)} className="close-btn">
              Закрыть
            </button>
          </div>

          <div>
            <h4 className="section-title small-margin">Цвет</h4>
            <div className="color-picker-container">
              <DebouncedColorPicker 
                value={furniture.find(f => f.id === selectedId)?.color || '#ffffff'}
                onChange={(c) => updateFurniture(selectedId!, { color: c })}
                className="color-input"
              />
            </div>
          </div>

          <div className="controls-group">
            <h4 className="section-title small-margin">Размеры</h4>
            <div className="dimension-controls">
               <div className="dimension-row">
                  <label className="dimension-row-label">
                     Ширина
                     <span>{furniture.find(f => f.id === selectedId)?.scale[0].toFixed(1)}x</span>
                  </label>
                  <input type="range" min="0.5" max="3" step="0.1" 
                     value={furniture.find(f => f.id === selectedId)?.scale[0] || 1} 
                     onChange={(e) => {
                        const item = furniture.find(f => f.id === selectedId);
                        if (item) updateFurniture(selectedId!, { scale: [Number(e.target.value), item.scale[1], item.scale[2]] })
                     }}
                     className="dimension-range"
                  />
               </div>
               <div className="dimension-row">
                  <label className="dimension-row-label">
                     Высота
                     <span>{furniture.find(f => f.id === selectedId)?.scale[1].toFixed(1)}x</span>
                  </label>
                  <input type="range" min="0.5" max="3" step="0.1" 
                     value={furniture.find(f => f.id === selectedId)?.scale[1] || 1} 
                     onChange={(e) => {
                        const item = furniture.find(f => f.id === selectedId);
                        if (item) updateFurniture(selectedId!, { scale: [item.scale[0], Number(e.target.value), item.scale[2]] })
                     }}
                     className="dimension-range"
                  />
               </div>
               <div className="dimension-row">
                  <label className="dimension-row-label">
                     Глубина
                     <span>{furniture.find(f => f.id === selectedId)?.scale[2].toFixed(1)}x</span>
                  </label>
                  <input type="range" min="0.5" max="3" step="0.1" 
                     value={furniture.find(f => f.id === selectedId)?.scale[2] || 1} 
                     onChange={(e) => {
                        const item = furniture.find(f => f.id === selectedId);
                        if (item) updateFurniture(selectedId!, { scale: [item.scale[0], item.scale[1], Number(e.target.value)] })
                     }}
                     className="dimension-range"
                  />
               </div>
            </div>
            <button 
              onClick={() => {
                const item = furniture.find(f => f.id === selectedId);
                if (item) {
                   updateFurniture(selectedId!, { rotation: [item.rotation[0], item.rotation[1] + Math.PI / 4, item.rotation[2]] });
                }
              }}
              className="action-btn action-btn-secondary"
            >
              <RotateCw className="action-icon" />
              Повернуть 45°
            </button>
            <button 
              onClick={() => removeFurniture(selectedId!)}
              className="action-btn action-btn-danger"
            >
              <Trash2 className="action-icon" />
              Удалить объект
            </button>
          </div>
        </div>
      )}

      {selectedType === 'window' && (
        <div className="panel-section-space">
           <div className="panel-header">
              <h3 className="section-title small-margin">Настройки Окна</h3>
              <button onClick={() => setSelection(null, null)} className="close-btn">
                Закрыть
              </button>
           </div>
          <button 
            onClick={() => removeWindow(selectedId!)}
            className="action-btn action-btn-danger"
          >
            <Trash2 className="action-icon" />
            Удалить окно
          </button>
        </div>
      )}
    </aside>
  );
}
