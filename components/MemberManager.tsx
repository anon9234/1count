import React, { useState } from 'react';
import { Member } from '../types';
import { Button, PlusIcon, TrashIcon } from './UIComponents';

interface MemberManagerProps {
  members: Member[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({ members, onAddMember, onRemoveMember }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddMember(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Members</h2>
        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
          {members.length} people
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="group flex items-center gap-2 pr-2 pl-1 py-1 bg-slate-800 border border-slate-700 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-bold`}>
              {member.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-200 truncate max-w-[80px]">
              {member.name}
            </span>
            {members.length > 1 && (
              <button
                onClick={() => onRemoveMember(member.id)}
                className="text-slate-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-700 transition-colors"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add person..."
          className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:bg-slate-800 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm placeholder:text-slate-600"
        />
        <Button type="submit" variant="secondary" disabled={!newName.trim()} className="!px-3">
          <PlusIcon />
        </Button>
      </form>
    </div>
  );
};