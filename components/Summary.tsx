
import React, { useMemo } from 'react';
import { BillItem, Member } from '../types';
import { Card, Button, SaveIcon } from './UIComponents';

interface SummaryProps {
  items: BillItem[];
  members: Member[];
  tip: number;
  onTipChange: (val: number) => void;
  onSave: () => void;
}

export const Summary: React.FC<SummaryProps> = ({
  items,
  members,
  tip,
  onTipChange,
  onSave
}) => {
  
  const breakdown = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    
    // Calculate raw share per person (subtotal only)
    const memberShares: Record<string, number> = {};
    members.forEach(m => memberShares[m.id] = 0);

    items.forEach(item => {
      const count = item.assignedMembers.length;
      if (count > 0) {
        const share = item.price / count;
        item.assignedMembers.forEach(mid => {
          if (memberShares[mid] !== undefined) {
            memberShares[mid] += share;
          }
        });
      }
    });

    // Distribute Tip proportionally based on subtotal share
    // Formula: (MemberSubtotal / TotalSubtotal) * TotalTip
    const finalBreakdown = members.map(m => {
      const share = memberShares[m.id] || 0;
      const proportion = subtotal > 0 ? share / subtotal : 0;
      
      const myTip = tip * proportion;
      
      return {
        ...m,
        subtotal: share,
        tipShare: myTip,
        total: share + myTip
      };
    });

    return {
      totalSubtotal: subtotal,
      finalTotal: subtotal + tip,
      members: finalBreakdown
    };

  }, [items, members, tip]);

  return (
    <Card className="sticky top-6 h-fit border-emerald-900/30 shadow-emerald-900/20">
      <h2 className="text-lg font-bold text-slate-100 mb-4">Current Receipt</h2>

      {/* Global Extras */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tip</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">€</span>
            <input 
              type="number" 
              value={tip === 0 ? '' : tip}
              onChange={(e) => onTipChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-slate-600"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 mb-6">
        {breakdown.members.map(m => (
          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                {m.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{m.name}</p>
                <p className="text-[10px] text-slate-500">
                  Sub: €{m.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-100">€{m.total.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grand Total */}
      <div className="pt-4 border-t border-slate-800 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-sm font-medium text-slate-500">Total Bill</span>
          <span className="text-2xl font-black text-slate-100 tracking-tight">
            €{breakdown.finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <Button 
        onClick={onSave} 
        disabled={items.length === 0} 
        className="w-full"
        variant="primary"
        icon={<SaveIcon />}
      >
        Submit & Save to Folder
      </Button>
    </Card>
  );
};
