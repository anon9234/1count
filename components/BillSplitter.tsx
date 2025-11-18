import React, { useState } from 'react';
import { BillItem, Member } from '../types';
import { Button, PlusIcon, TrashIcon, Card } from './UIComponents';

interface BillSplitterProps {
  items: BillItem[];
  members: Member[];
  onUpdateItem: (id: string, updated: Partial<BillItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
}

export const BillSplitter: React.FC<BillSplitterProps> = ({
  items,
  members,
  onUpdateItem,
  onDeleteItem,
  onAddItem
}) => {
  // Use local state to handle claiming menu visibility
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);

  const toggleMemberAssignment = (itemId: string, memberId: string, currentAssigned: string[]) => {
    const isAssigned = currentAssigned.includes(memberId);
    let newAssigned: string[];

    if (isAssigned) {
      // Remove member, but don't let the array become empty (UX choice: keep at least one or empty? Empty is allowed, means no one pays yet)
      newAssigned = currentAssigned.filter(id => id !== memberId);
    } else {
      newAssigned = [...currentAssigned, memberId];
    }
    onUpdateItem(itemId, { assignedMembers: newAssigned });
  };

  const handleClaim = (itemId: string, memberId: string) => {
    onUpdateItem(itemId, { assignedMembers: [memberId] });
    setClaimingItemId(null);
  };

  const handleAssignAll = (itemId: string) => {
    onUpdateItem(itemId, { assignedMembers: members.map(m => m.id) });
    setClaimingItemId(null);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="!p-4 transition-shadow hover:shadow-md hover:shadow-emerald-900/10 hover:border-slate-700">
          <div className="flex flex-col gap-3">
            {/* Item Header: Inputs */}
            <div className="flex items-start gap-3">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                className="flex-1 font-medium text-slate-100 bg-transparent border-b border-transparent focus:border-accent outline-none placeholder:text-slate-600"
                placeholder="Item name"
              />
              <div className="flex items-center gap-1 border-b border-slate-700 focus-within:border-accent px-1">
                <span className="text-slate-500 text-sm">€</span>
                <input
                  type="number"
                  value={item.price === 0 ? '' : item.price}
                  onChange={(e) => onUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                  className="w-20 text-right font-mono font-medium text-slate-100 bg-transparent outline-none placeholder:text-slate-600"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="text-slate-600 hover:text-red-400 transition-colors pt-1"
                aria-label="Delete item"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Assignment Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 border-t border-slate-800 pt-3">
              
              {/* Avatars */}
              <div className="flex flex-wrap items-center gap-2">
                {members.map((member) => {
                  const isAssigned = item.assignedMembers.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMemberAssignment(item.id, member.id, item.assignedMembers)}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                        ${isAssigned 
                          ? `${member.color} text-white border-transparent scale-100` 
                          : 'bg-slate-800 text-slate-500 border-slate-700 grayscale opacity-60 hover:opacity-100 hover:scale-105'}
                      `}
                      title={`${isAssigned ? 'Remove' : 'Add'} ${member.name}`}
                    >
                      {member.name.substring(0, 2).toUpperCase()}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setClaimingItemId(claimingItemId === item.id ? null : item.id)}
                  className="text-xs font-medium text-accent hover:text-emerald-400 underline decoration-dashed underline-offset-4"
                >
                  Claim Item
                </button>

                {/* Dropdown for "Claim" */}
                {claimingItemId === item.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-20 overflow-hidden">
                    <div className="p-2">
                        <button 
                           onClick={() => handleAssignAll(item.id)}
                           className="w-full text-left px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-700 hover:text-slate-200 rounded-lg"
                        >
                            Split with Everyone
                        </button>
                        <div className="h-px bg-slate-700 my-1"></div>
                        {members.map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleClaim(item.id, m.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full ${m.color}`}></div>
                                <span className="text-sm text-slate-200 truncate">{m.name}</span>
                            </button>
                        ))}
                    </div>
                    {/* Backdrop to close */}
                    <div 
                        className="fixed inset-0 z-[-1]" 
                        onClick={() => setClaimingItemId(null)}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={onAddItem} variant="secondary" className="w-full border-dashed border-2" icon={<PlusIcon />}>
        Add Item
      </Button>
    </div>
  );
};