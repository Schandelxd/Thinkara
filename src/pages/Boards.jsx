import { useState, useRef } from 'react';
import { Plus, Trash2, X, GripVertical, Edit3, MoreHorizontal, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';

const LABEL_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
const BOARD_COLORS = ['#8B5CF6', '#F472B6', '#FBBF24', '#34D399', '#3B82F6', '#EF4444', '#F97316', '#06B6D4'];

export default function Boards() {
  const { boards, addBoard, deleteBoard, addBoardCard, deleteBoardCard, moveBoardCard, reorderBoardCards, updateBoardCard } = useStore();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#8B5CF6');
  const [addingCardTo, setAddingCardTo] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardLabel, setNewCardLabel] = useState('');
  const [editingCard, setEditingCard] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Drag state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const dragOverBoard = useRef(null);

  const handleDragStart = (e, boardId, cardId, cardIndex) => {
    dragItem.current = { boardId, cardId, cardIndex };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    // Make drag image slightly transparent
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    dragItem.current = null;
    dragOverItem.current = null;
    dragOverBoard.current = null;
    // Remove all drag-over styling
    document.querySelectorAll('.board-column').forEach(el => {
      el.style.backgroundColor = '';
    });
    document.querySelectorAll('.card-drop-indicator').forEach(el => {
      el.style.height = '0';
    });
  };

  const handleDragOver = (e, boardId, cardIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverBoard.current = boardId;
    dragOverItem.current = cardIndex;

    // Highlight the board column
    document.querySelectorAll('.board-column').forEach(el => {
      el.style.backgroundColor = '';
    });
    const col = document.getElementById(`board-${boardId}`);
    if (col) col.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
  };

  const handleDrop = (e, toBoardId, toIndex) => {
    e.preventDefault();
    if (!dragItem.current) return;
    const { boardId: fromBoardId, cardId, cardIndex: fromIndex } = dragItem.current;

    if (fromBoardId === toBoardId) {
      // Reorder within same board
      if (fromIndex !== toIndex) {
        reorderBoardCards(toBoardId, fromIndex, toIndex);
      }
    } else {
      // Move to different board
      moveBoardCard(fromBoardId, toBoardId, cardId, toIndex);
    }

    dragItem.current = null;
    // Clean up highlights
    document.querySelectorAll('.board-column').forEach(el => {
      el.style.backgroundColor = '';
    });
  };

  const handleColumnDrop = (e, toBoardId) => {
    e.preventDefault();
    if (!dragItem.current) return;
    const { boardId: fromBoardId, cardId } = dragItem.current;
    if (fromBoardId !== toBoardId) {
      moveBoardCard(fromBoardId, toBoardId, cardId);
    }
    dragItem.current = null;
    document.querySelectorAll('.board-column').forEach(el => {
      el.style.backgroundColor = '';
    });
  };

  const handleAddBoard = () => {
    if (!newBoardTitle.trim()) return;
    addBoard(newBoardTitle, newBoardColor);
    setNewBoardTitle('');
    setNewBoardColor('#8B5CF6');
    setShowNewBoard(false);
  };

  const handleAddCard = (boardId) => {
    if (!newCardTitle.trim()) return;
    addBoardCard(boardId, newCardTitle, newCardLabel);
    setNewCardTitle('');
    setNewCardLabel('');
    setAddingCardTo(null);
  };

  const handleEditSave = (boardId, cardId) => {
    if (!editTitle.trim()) return;
    updateBoardCard(boardId, cardId, { title: editTitle });
    setEditingCard(null);
    setEditTitle('');
  };

  return (
    <div className="page-enter" style={{ paddingBottom: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>📋 Task Boards</h1>
          <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500 }}>Drag and drop cards to organize your study pipeline.</p>
        </div>
        <button className="btn-primary" style={{ padding: '14px 28px' }} onClick={() => setShowNewBoard(true)}>
          <Plus size={20} /> New Board
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '24px', height: 'calc(100vh - 240px)', alignItems: 'flex-start' }}>
        {boards.map((col) => (
          <div 
            key={col.id}
            id={`board-${col.id}`}
            className="board-column"
            onDragOver={(e) => handleDragOver(e, col.id, col.cards.length)}
            onDrop={(e) => handleColumnDrop(e, col.id)}
            style={{ 
              flex: '0 0 300px', 
              borderRadius: '16px',
              border: '2px solid var(--fg)',
              boxShadow: 'var(--shadow-hard)',
              padding: '0',
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: 'var(--card-bg, white)',
              maxHeight: '100%',
              transition: 'background-color 0.2s ease',
              overflow: 'hidden',
            }}
          >
            {/* Column Header */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '2px solid var(--fg)',
              background: col.color,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', textShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}>{col.title}</h2>
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.3)', color: 'white',
                  padding: '2px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: 800 
                }}>{col.cards.length}</span>
              </div>
              <button onClick={() => deleteBoard(col.id)} 
                style={{ color: 'rgba(255,255,255,0.7)', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                <Trash2 size={16} />
              </button>
            </div>

            {/* Cards Container */}
            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {col.cards.map((card, cardIdx) => (
                <div 
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id, card.id, cardIdx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => { e.preventDefault(); handleDragOver(e, col.id, cardIdx); }}
                  onDrop={(e) => handleDrop(e, col.id, cardIdx)}
                  style={{ 
                    padding: '14px 16px',
                    backgroundColor: 'var(--card-bg, white)',
                    border: '2px solid var(--border-color, var(--fg))',
                    borderRadius: '10px',
                    cursor: 'grab',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '2px 2px 0 var(--fg)',
                    position: 'relative',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `3px 3px 0 ${col.color}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--fg)';
                  }}
                >
                  {/* Card label */}
                  {card.label && (
                    <div style={{ 
                      width: '40px', height: '6px', borderRadius: '3px', 
                      backgroundColor: card.label, marginBottom: '10px' 
                    }} />
                  )}

                  {editingCard === card.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input className="input-base" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEditSave(col.id, card.id)}
                        autoFocus style={{ fontSize: '13px', padding: '6px 10px' }} />
                      <button onClick={() => handleEditSave(col.id, card.id)} style={{ color: 'var(--quaternary)', padding: '4px' }}>✓</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                        <GripVertical size={14} color="var(--gray-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: 'var(--fg)' }}>{card.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                        <button onClick={() => { setEditingCard(card.id); setEditTitle(card.title); }}
                          style={{ color: 'var(--gray-400)', padding: '2px' }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--gray-400)'}>
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => deleteBoardCard(col.id, card.id)}
                          style={{ color: 'var(--gray-400)', padding: '2px' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--gray-400)'}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 500, marginTop: '8px' }}>
                    {new Date(card.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              
              {/* Drop zone indicator when empty */}
              {col.cards.length === 0 && (
                <div style={{ 
                  padding: '32px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px', fontWeight: 600,
                  border: '2px dashed var(--gray-300)', borderRadius: '10px',
                }}>
                  Drop cards here
                </div>
              )}

              {/* Add card */}
              {addingCardTo === col.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                  <input className="input-base" placeholder="Card title..." value={newCardTitle}
                    onChange={e => setNewCardTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCard(col.id)}
                    autoFocus style={{ fontSize: '13px', padding: '10px 12px' }} />
                  
                  {/* Label picker */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Tag size={12} color="var(--gray-400)" />
                    {LABEL_COLORS.map(c => (
                      <button key={c} onClick={() => setNewCardLabel(newCardLabel === c ? '' : c)}
                        style={{ 
                          width: '18px', height: '18px', borderRadius: '4px', backgroundColor: c, border: newCardLabel === c ? '2px solid var(--fg)' : '2px solid transparent',
                          cursor: 'pointer', transition: 'transform 0.15s ease',
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px', flex: 1 }} onClick={() => handleAddCard(col.id)}>Add</button>
                    <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => { setAddingCardTo(null); setNewCardTitle(''); setNewCardLabel(''); }}><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingCardTo(col.id)}
                  style={{ padding: '12px', border: '2px dashed var(--gray-300)', borderRadius: '10px', color: 'var(--gray-500)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = col.color; e.currentTarget.style.color = col.color; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.color = 'var(--gray-500)'; }}>
                  <Plus size={14} /> Add Card
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Board */}
        {showNewBoard ? (
          <div style={{ 
            flex: '0 0 300px', border: '2px solid var(--fg)', borderRadius: '16px', padding: '20px',
            backgroundColor: 'var(--card-bg, white)', boxShadow: 'var(--shadow-hard)',
            display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeInScale 0.2s ease-out'
          }}>
            <h3 style={{ fontSize: '16px' }}>New Board</h3>
            <input className="input-base" placeholder="Board title..." value={newBoardTitle}
              onChange={e => setNewBoardTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddBoard()} autoFocus />
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {BOARD_COLORS.map(c => (
                <button key={c} onClick={() => setNewBoardColor(c)}
                  style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: c, border: newBoardColor === c ? '3px solid var(--fg)' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddBoard}>Create</button>
              <button className="btn-secondary" onClick={() => { setShowNewBoard(false); setNewBoardTitle(''); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowNewBoard(true)}
            style={{ 
              flex: '0 0 300px', height: '120px', border: '2px dashed var(--gray-300)', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: 'var(--gray-500)', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.color = 'var(--gray-500)'; }}>
            <Plus size={20} /> Add Board
          </button>
        )}
      </div>
    </div>
  );
}
