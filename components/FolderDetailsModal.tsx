
import React from 'react';
import { BillFolder } from '../types';
import { Button, Card, XMarkIcon, EditIcon } from './UIComponents';

interface FolderDetailsModalProps {
  folder: BillFolder | null;
  onClose: () => void;
  onEdit: (folder: BillFolder) => void;
}

export const FolderDetailsModal: React.FC<FolderDetailsModalProps> = ({ folder, onClose, onEdit }) => {
  if (!folder) return null;

  // Helper to get member details by ID
  const getMember = (id: string) => folder.members.find(m => m.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{folder.name}</h2>
            <p className="text-sm text-slate-500">{folder.date}</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="hidden sm:inline-block bg-emerald-900/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-900/50 mr-2">
                Total: €{folder.total.toFixed(2)}
             </span>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <XMarkIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Items & Summary */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Items List */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Items Breakdown</h3>
              <div className="space-y-2">
                {folder.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium">{item.name}</p>
                      <div className="flex mt-1 -space-x-1 overflow-hidden">
                        {item.assignedMembers.map(mid => {
                          const m = getMember(mid);
                          if (!m) return null;
                          return (
                            <div key={m.id} className={`w-5 h-5 rounded-full ${m.color} ring-1 ring-slate-800 flex items-center justify-center text-[8px] text-white font-bold`} title={m.name}>
                              {m.name.substring(0, 1)}
                            </div>
                          );
                        })}
                        {item.assignedMembers.length === 0 && (
                            <span className="text-xs text-slate-600 italic">No one assigned</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-100 font-mono font-bold">€{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                
                {/* Tip Row */}
                {folder.tip > 0 && (
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                        <p className="text-slate-400 font-medium">Tip</p>
                        <p className="text-slate-100 font-mono font-bold">€{folder.tip.toFixed(2)}</p>
                    </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end pt-4 border-t border-slate-800">
                 <span className="text-slate-500 font-medium">Grand Total</span>
                 <span className="text-2xl font-black text-emerald-400">€{folder.total.toFixed(2)}</span>
            </div>

          </div>

          {/* Right Column: Receipt Image */}
          <div className="lg:w-[400px] bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
             <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Original Receipt</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-stripes">
                {folder.receiptImage ? (
                    <img 
                        src={folder.receiptImage} 
                        alt="Receipt" 
                        className="w-full h-auto object-contain rounded-lg shadow-lg" 
                    />
                ) : (
                    <div className="text-slate-600 text-sm flex flex-col items-center">
                        <span className="block mb-2 opacity-50 text-4xl">📄</span>
                        No image saved
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
           <Button variant="secondary" onClick={onClose}>Close</Button>
           <Button variant="primary" onClick={() => onEdit(folder)} icon={<EditIcon />}>
              Edit & Update
           </Button>
        </div>

      </div>
    </div>
  );
};
