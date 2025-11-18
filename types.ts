
export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  assignedMembers: string[]; // Array of Member IDs
}

export interface BillData {
  items: BillItem[];
  tip: number;
}

export interface ParsedReceipt {
  items: { name: string; price: number }[];
  tip: number;
  merchantName?: string;
  date?: string;
}

export interface BillFolder {
  id: string;
  name: string;
  date: string;
  items: BillItem[];
  members: Member[]; // Snapshot of members at time of saving
  tip: number;
  total: number;
  receiptImage: string | null;
  createdAt: number;
}
