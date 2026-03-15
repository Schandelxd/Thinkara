import { useState } from 'react';
import { Calendar, Plus, Clock, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function StudyPlanner() {
  const { studyEvents, addStudyEvent, deleteStudyEvent } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', duration: '', type: 'Review' });

  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).getDay();

  // Group events by date
  const todayStr = now.toISOString().split('T')[0];
  const todayEvents = studyEvents
    .filter(e => e.date === todayStr)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const upcomingEvents = studyEvents
    .filter(e => e.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
    .slice(0, 5);

  // Dates that have events
  const eventDates = new Set(studyEvents.map(e => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === currentYear) return d.getDate();
    return null;
  }).filter(Boolean));

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    addStudyEvent(newEvent);
    setNewEvent({ title: '', date: '', time: '', duration: '', type: 'Review' });
    setShowModal(false);
  };

  const typeColors = {
    'Review': 'var(--primary)',
    'Quiz': 'var(--quaternary)',
    'Flashcards': 'var(--tertiary)',
    'Reading': 'var(--secondary)',
    'Other': 'var(--gray-500)',
  };

  return (
    <div style={{ paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Study Planner</h1>
          <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500 }}>Organize your study schedule and stay on track.</p>
        </div>
        <button className="btn-primary" style={{ padding: '16px 32px' }} onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Study Session
        </button>
      </div>

      <div className="layout-grid">
        {/* Calendar Widget */}
        <div style={{ gridColumn: 'span 4' }}>
          <div className="sticker-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px' }}>{currentMonth} {currentYear}</h2>
              <Calendar size={20} color="var(--gray-500)" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '16px' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-400)', padding: '4px' }}>{d}</div>
              ))}
              {/* Empty cells for days before the 1st */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`}></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === currentDay;
                const hasEvent = eventDates.has(day);
                return (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '6px', 
                      borderRadius: '8px', 
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'default',
                      position: 'relative',
                      backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday ? 'white' : 'var(--fg)',
                      border: isToday ? '2px solid var(--fg)' : '2px solid transparent'
                    }}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="sticker-card" style={{ padding: '24px', backgroundColor: 'var(--primary)', color: 'white' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Study Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500, opacity: 0.9 }}>Total Sessions</span>
                <span style={{ fontWeight: 800 }}>{studyEvents.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500, opacity: 0.9 }}>Today's Sessions</span>
                <span style={{ fontWeight: 800 }}>{todayEvents.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500, opacity: 0.9 }}>Upcoming</span>
                <span style={{ fontWeight: 800 }}>{upcomingEvents.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Schedule */}
        <div style={{ gridColumn: 'span 8' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Today's Schedule</h2>
          
          {todayEvents.length === 0 ? (
            <div className="sticker-card" style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--gray-50)', marginBottom: '32px' }}>
              <Clock size={40} color="var(--gray-400)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', color: 'var(--gray-600)', marginBottom: '8px' }}>No sessions scheduled for today</h3>
              <p style={{ color: 'var(--gray-500)', fontWeight: 500 }}>Add a study session to get started!</p>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => {
                setNewEvent(prev => ({ ...prev, date: todayStr }));
                setShowModal(true);
              }}>
                <Plus size={18} /> Add Session for Today
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', marginBottom: '32px' }}>
              <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--gray-200)', zIndex: 0 }}></div>
              {todayEvents.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1, alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white', border: `4px solid ${typeColors[item.type] || 'var(--primary)'}`, flexShrink: 0 }}></div>
                  <div className="sticker-card" style={{ padding: '24px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: typeColors[item.type] || 'var(--primary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.time || 'All Day'}
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                      {item.duration && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '14px', fontWeight: 500 }}>
                          <Clock size={16} /> {item.duration}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ padding: '6px 16px', borderRadius: '999px', backgroundColor: 'var(--gray-100)', border: '2px solid var(--fg)', fontWeight: 700, fontSize: '14px' }}>
                        {item.type}
                      </span>
                      <button onClick={() => deleteStudyEvent(item.id)} style={{ color: 'var(--gray-400)', padding: '4px' }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Upcoming Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingEvents.map((item) => (
                  <div key={item.id} className="sticker-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: typeColors[item.type] || 'var(--primary)', border: '2px solid var(--fg)' }}></div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{item.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
                          {new Date(item.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {item.time && ` at ${item.time}`}
                          {item.duration && ` • ${item.duration}`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteStudyEvent(item.id)} style={{ color: 'var(--gray-400)', padding: '4px' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px' }}>Add Study Session</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--gray-400)' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Session Title *</label>
                <input className="input-base" placeholder="e.g., Biology Chapter 5 Review" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Date *</label>
                  <input className="input-base" type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Time</label>
                  <input className="input-base" type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Duration</label>
                  <input className="input-base" placeholder="e.g., 1 hour" value={newEvent.duration} onChange={e => setNewEvent({ ...newEvent, duration: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Type</label>
                  <select className="input-base" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}>
                    <option value="Review">Review</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Flashcards">Flashcards</option>
                    <option value="Reading">Reading</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={handleAddEvent}>
                <Plus size={18} /> Add Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
