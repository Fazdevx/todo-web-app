import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

export function AdminBadge({ assignedToName, createdBy, isAdmin }) {
  const displayName = assignedToName || createdBy || 'Sin asignar';

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border" style={{ 
      backgroundColor: 'var(--primary)10',
      color: 'var(--primary)',
      borderColor: 'var(--primary)20'
    }}>
      {isAdmin ? (
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
      ) : (
        <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
      )}
      <span className="truncate max-w-[120px]">{displayName}</span>
    </span>
  );
}