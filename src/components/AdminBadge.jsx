import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

export function AdminBadge({ assignedToName, createdBy, isAdmin }) {
  const displayName = assignedToName || createdBy || 'Sin asignar';

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/30">
      {isAdmin ? (
        <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
      ) : (
        <User className="w-3.5 h-3.5 text-orange-400" />
      )}
      <span className="truncate max-w-[120px]">{displayName}</span>
    </span>
  );
}
