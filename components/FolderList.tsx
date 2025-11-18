
import React from 'react';
import { BillFolder } from '../types';
import { Card, FolderIcon } from './UIComponents';

interface FolderListProps {
  folders: BillFolder[];
  onFolderSelect: (folder: BillFolder) => void;
}

export const FolderList: React.FC<FolderListProps> = ({ folders, onFolderSelect }) => {
  if (folders.length === 0) return null;

  return (
    <div className="space-y-4 mt-12">
      <div className="flex items-center gap-3 mb-6">
         <div className="p-2 bg-slate-800 rounded-lg">
            <FolderIcon className="w-6 h-6 text-slate-400" />
         </div>
         <h2 className="text-2xl font-bold text-slate-200">Saved Bills</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <Card 
            key={folder.id} 
            onClick={() => onFolderSelect(folder)}
            className="group hover:bg-slate-800/50 transition-all cursor-pointer relative overflow-hidden hover:shadow-emerald-900/10 hover:border-emerald-500/30"
          >
            {folder.receiptImage && (
                <div className="absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <img src={folder.receiptImage} alt="" className="w-full h-full object-cover grayscale" />
                </div>
            )}
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors">{folder.name}</h3>
                            <p className="text-xs text-slate-500">{folder.date}</p>
                        </div>
                        <span className="bg-emerald-900/30 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-900/50">
                            €{folder.total.toFixed(2)}
                        </span>
                    </div>
                    
                    <div className="mt-4 flex -space-x-2 overflow-hidden py-1">
                        {folder.members.map((member) => (
                            <div key={member.id} className={`inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 ${member.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                                {member.name.substring(0, 1)}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        {folder.items.length} items • {folder.members.length} people
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-accent transition-colors">
                        View Details →
                    </span>
                </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
