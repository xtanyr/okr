import React from 'react';

interface KeyResultTableHeaderProps {
  icon?: React.ReactNode;
}

const KeyResultTableHeader: React.FC<KeyResultTableHeaderProps> = ({ icon }) => (
  <thead>
    <tr style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      fontWeight: 700,
      fontSize: 15,
      color: '#1a202c',
      height: 48,
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
    }}>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>Прогресс</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>№</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#1a202c', background: 'transparent', border: 'none', textAlign: 'left', whiteSpace: 'nowrap' }}>Ключевой результат</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>Метрика</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>База</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>План</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>Факт</th>
      <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: 15, color: '#64748b', background: 'transparent', border: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>Формула</th>
      <th style={{ padding: '12px 8px', background: 'transparent', border: 'none', minWidth: 36 }}></th>
      <th style={{ padding: '12px 8px', background: 'transparent', border: 'none', minWidth: 36 }}></th>
    </tr>
    {icon && (
      <tr>
        <td colSpan={10} style={{ textAlign: 'right', padding: 0 }}>{icon}</td>
      </tr>
    )}
  </thead>
);

export default KeyResultTableHeader; 