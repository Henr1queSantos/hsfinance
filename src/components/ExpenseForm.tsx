import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const ExpenseForm = ({ onComplete }: { onComplete: () => void }) => {
  const { houseId } = useAuth();
  const [description, setDescription] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isVariable, setIsVariable] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const groupId = Math.random().toString(36).substr(2, 9);
    const planned = parseFloat(plannedAmount);

    for (let i = 0; i < (isRecurring ? 12 : 1); i++) {
      const d = new Date(date);
      d.setMonth(d.getMonth() + i);
      
      await addDoc(collection(db, 'expenses'), { 
        houseId, 
        description, 
        plannedAmount: planned, 
        spentAmount: 0, 
        isVariable, 
        dueDate: d, 
        isPaid: false, 
        groupId, 
        createdAt: serverTimestamp() 
      });
    }
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-xl space-y-3">
      <input className="w-full p-2 bg-gray-700 rounded text-sm" placeholder="Description" onChange={e => setDescription(e.target.value)} required />
      <input type="number" className="w-full p-2 bg-gray-700 rounded text-sm" placeholder="Amount (€)" onChange={e => setPlannedAmount(e.target.value)} required />
      <input type="date" className="w-full p-2 bg-gray-700 rounded text-sm" onChange={e => setDate(e.target.value)} required />
      
      <div className="flex gap-4 text-xs text-gray-400">
        <label className="flex items-center gap-1"><input type="radio" name="type" onChange={() => setIsVariable(false)} defaultChecked /> Fixed</label>
        <label className="flex items-center gap-1"><input type="radio" name="type" onChange={() => setIsVariable(true)} /> Variable</label>
      </div>
      
      <label className="flex items-center gap-2 text-xs text-gray-400">
        <input type="checkbox" onChange={e => setIsRecurring(e.target.checked)} /> Recurring (12 months)
      </label>
      <button className="w-full bg-emerald-600 p-2 rounded text-sm font-bold">Save</button>
    </form>
  );
};