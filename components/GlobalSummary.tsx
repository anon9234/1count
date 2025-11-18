
import React, { useMemo } from 'react';
import { BillFolder } from '../types';
import { Card } from './UIComponents';

interface GlobalSummaryProps {
  folders: BillFolder[];
}

export const GlobalSummary: React.FC<GlobalSummaryProps> = ({ folders }) => {
  if (folders.length === 0) return null;

  const { grandTotal, memberTotals } = useMemo(() => {
    const memberMap = new Map<string, { amount: number, color: string }>();
    let grandTotal = 0;

    folders.forEach(folder => {
      grandTotal += folder.total;
      
      // Calculate member shares for this folder to accurately distribute tip
      const folderMemberShares = new Map<string, number>();
      let folderSubtotal = 0;

      folder.items.forEach(item => {
        if (item.assignedMembers.length > 0) {
          const share = item.price / item.assignedMembers.length;
          item.assignedMembers.forEach(mid => {
            folderMemberShares.set(mid, (folderMemberShares.get(mid) || 0) + share);
          });
          folderSubtotal += item.price;
        }
      });

      // Add to global totals (aggregated by Name to unify across bills)
      folder.members.forEach(member => {
        const share = folderMemberShares.get(member.id) || 0;
        // Proportional tip calculation
        const proportion = folderSubtotal > 0 ? share / folderSubtotal : 0;
        const totalShare = share + (folder.tip * proportion);

        if (totalShare > 0) {
             const current = memberMap.get(member.name);
             // Accumulate
             memberMap.set(member.name, {
                 amount: (current?.amount || 0) + totalShare,
                 color: member.color // Use the latest color found for this name
             });
        }
      });
    });

    // Sort members by total amount owed (descending)
    const sortedMembers = Array.from(memberMap.entries())
        .sort((a, b) => b[1].amount - a[1].amount);

    return { grandTotal, memberTotals: sortedMembers };
  }, [folders]);

  return (
    <div className="mt-16 border-t border-slate-800 pt-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
            </div>
            Total Group Spending
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grand Total Card */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 flex flex-col justify-center items-center md:col-span-1 shadow-lg shadow-slate-900/50">
                <p className="text-slate-400 font-medium mb-2 text-sm uppercase tracking-widest">Total Expenses</p>
                <p className="text-5xl font-black text-white tracking-tight">€{grandTotal.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-4 font-medium">{folders.length} receipts processed</p>
            </Card>

            {/* Member Breakdown */}
            <Card className="md:col-span-2 border-slate-800">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Member Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {memberTotals.map(([name, data]) => (
                        <div key={name} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${data.color} flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                                    {name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-200">{name}</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-400 font-mono">€{data.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
  );
};
