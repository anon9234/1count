
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Member, BillItem, ParsedReceipt, BillFolder } from './types';
import { INITIAL_MEMBERS, MEMBER_COLORS } from './constants';
import { ReceiptUploader } from './components/ReceiptUploader';
import { MemberManager } from './components/MemberManager';
import { BillSplitter } from './components/BillSplitter';
import { Summary } from './components/Summary';
import { FolderList } from './components/FolderList';
import { GlobalSummary } from './components/GlobalSummary';
import { FolderDetailsModal } from './components/FolderDetailsModal';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [items, setItems] = useState<BillItem[]>([]);
  const [tip, setTip] = useState(0);
  
  // New State for Folder/Save logic
  const [folders, setFolders] = useState<BillFolder[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [billMetadata, setBillMetadata] = useState<{name: string, date: string} | null>(null);
  
  // State for Folder viewing
  const [selectedFolder, setSelectedFolder] = useState<BillFolder | null>(null);

  // --- Member Handlers ---

  const addMember = (name: string) => {
    const newMember: Member = {
      id: uuidv4(),
      name,
      color: MEMBER_COLORS[members.length % MEMBER_COLORS.length]
    };
    setMembers(prev => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    // Also remove them from any assigned items
    setItems(prev => prev.map(item => ({
      ...item,
      assignedMembers: item.assignedMembers.filter(mId => mId !== id)
    })));
  };

  // --- Bill Handlers ---

  const handleReceiptParsed = useCallback((data: ParsedReceipt) => {
    // When parsed, we create items assigned to ALL current members by default
    const allMemberIds = members.map(m => m.id);
    
    // Set Metadata for the folder name
    if (data.merchantName || data.date) {
        const name = data.merchantName || "Receipt";
        const date = data.date || new Date().toLocaleDateString();
        setBillMetadata({ name, date });
    } else {
        setBillMetadata({ name: `Bill #${folders.length + 1}`, date: new Date().toLocaleDateString() });
    }
    
    // Filter and separate Pfand items for summarization
    const pfandItems = data.items.filter(i => i.name.toLowerCase().includes('pfand'));
    const otherItems = data.items.filter(i => !i.name.toLowerCase().includes('pfand'));

    const newItems: BillItem[] = otherItems.map(item => ({
      id: uuidv4(),
      name: item.name,
      price: item.price,
      assignedMembers: [...allMemberIds]
    }));

    if (pfandItems.length > 0) {
        const totalPfand = pfandItems.reduce((sum, item) => sum + item.price, 0);
        newItems.push({
            id: uuidv4(),
            name: 'Pfand (Summarized)',
            price: parseFloat(totalPfand.toFixed(2)),
            assignedMembers: [...allMemberIds]
        });
    }

    setItems(prev => [...prev, ...newItems]);
    if (data.tip) setTip(prev => prev + data.tip);
  }, [members, folders.length]);

  const addItem = () => {
    const newItem: BillItem = {
      id: uuidv4(),
      name: `Item ${items.length + 1}`,
      price: 0,
      assignedMembers: members.map(m => m.id) // Default: everyone
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updated: Partial<BillItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updated } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // --- Folder / Save Logic ---

  const saveToFolder = () => {
    if (items.length === 0) return;

    const total = items.reduce((sum, i) => sum + i.price, 0) + tip;
    const folderName = billMetadata?.name || `Bill #${folders.length + 1}`;
    const folderDate = billMetadata?.date || new Date().toLocaleDateString();

    const newFolder: BillFolder = {
        id: uuidv4(),
        name: folderName,
        date: folderDate,
        items: [...items],
        members: [...members],
        tip,
        total,
        receiptImage: currentImage,
        createdAt: Date.now()
    };

    setFolders(prev => [newFolder, ...prev]);

    // Reset current workspace
    setItems([]);
    setTip(0);
    setCurrentImage(null);
    setBillMetadata(null);
    // We keep members active for the next bill usually, unless requested otherwise.
  };

  // Load a folder back into workspace for editing
  const handleEditFolder = (folder: BillFolder) => {
    // Restore state from folder
    setItems(folder.items);
    setMembers(folder.members);
    setTip(folder.tip);
    setCurrentImage(folder.receiptImage);
    setBillMetadata({ name: folder.name, date: folder.date });
    
    // Remove from saved list (Checking out)
    setFolders(prev => prev.filter(f => f.id !== folder.id));
    
    // Close modal
    setSelectedFolder(null);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-accent text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                        <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                        <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">1Count</h1>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <ReceiptUploader 
                image={currentImage}
                onImageUpload={setCurrentImage}
                onReceiptParsed={handleReceiptParsed} 
            />
            
            <div className="bg-surface rounded-2xl shadow-sm border border-slate-800 p-6">
               <MemberManager 
                  members={members} 
                  onAddMember={addMember} 
                  onRemoveMember={removeMember} 
               />
            </div>

            <div className="space-y-4">
               <h2 className="text-lg font-bold text-slate-100 pl-1">Items {billMetadata && <span className="text-slate-500 font-normal text-sm">- {billMetadata.name}</span>}</h2>
               {items.length === 0 ? (
                 <div className="text-center py-12 bg-surface rounded-2xl border-2 border-dashed border-slate-800">
                    <p className="text-slate-500 font-medium">No items yet</p>
                    <button onClick={addItem} className="text-accent hover:underline text-sm mt-2 font-medium">
                      Add one manually
                    </button>
                 </div>
               ) : (
                 <BillSplitter 
                    items={items} 
                    members={members}
                    onAddItem={addItem}
                    onDeleteItem={deleteItem}
                    onUpdateItem={updateItem}
                 />
               )}
            </div>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Summary 
               items={items} 
               members={members} 
               tip={tip} 
               onTipChange={setTip}
               onSave={saveToFolder}
            />
          </div>

        </div>
        
        {/* Global Totals */}
        <GlobalSummary folders={folders} />

        {/* Folder List */}
        <FolderList 
            folders={folders} 
            onFolderSelect={setSelectedFolder}
        />

        {/* Modals */}
        <FolderDetailsModal 
            folder={selectedFolder}
            onClose={() => setSelectedFolder(null)}
            onEdit={handleEditFolder}
        />
      </div>
    </div>
  );
};

export default App;
