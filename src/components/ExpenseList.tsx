import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const ExpenseList = ({ expenses }: { expenses: any[] }) => {

const handleTogglePaid = async (exp: any) => {
  const isNowPaid = !exp.isPaid;
  const updates: any = { isPaid: isNowPaid };

  if (exp.isVariable) {
    if (isNowPaid) {
      if (!exp.spentAmount || exp.spentAmount === 0) {
        updates.spentAmount = exp.plannedAmount;
      }

    }
  } else {
    updates.spentAmount = isNowPaid ? exp.plannedAmount : 0;
  }
  
  await updateDoc(doc(db, 'expenses', exp.id), updates);
};

  const handleDateEdit = async (exp: any) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):", exp.dueDate.toDate().toISOString().split('T')[0]);
    if (newDate) {
      await updateDoc(doc(db, 'expenses', exp.id), { dueDate: Timestamp.fromDate(new Date(newDate)) });
    }
  };

  const handleDelete = async (exp: any) => {
    const option = exp.groupId ? prompt("Delete: Type '1' for only this month, or '2' for this and all future months.") : "1";
    
    if (option === "1") {
      await deleteDoc(doc(db, 'expenses', exp.id));
    } else if (option === "2") {
      const q = query(collection(db, 'expenses'), where('groupId', '==', exp.groupId));
      const snap = await getDocs(q);
      const currentDueDate = exp.dueDate.toDate().getTime();
      const deletePromises = snap.docs
        .filter(doc => doc.data().dueDate.toDate().getTime() >= currentDueDate)
        .map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      alert("All future expenses deleted.");
    }
  };

  return (
    <div className="space-y-2 mt-4">
      {expenses.sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate()).map(exp => {
        const isOverdue = !exp.isPaid && exp.dueDate.toDate() < new Date(new Date().setHours(0,0,0,0));
        
        return (
          <div key={exp.id} className={`p-3 rounded-lg flex justify-between items-center text-sm ${exp.isPaid ? 'bg-emerald-900' : isOverdue ? 'bg-red-900' : 'bg-gray-800'}`}>
            {/* Descrição e edição */}
            <div className="flex-1 cursor-pointer" onClick={() => {
              const d = prompt("Edit description:", exp.description);
              if(d) updateDoc(doc(db, 'expenses', exp.id), { description: d });
            }}>
              <p className="font-bold">{exp.description} ✏️</p>
              <p className="text-[10px] opacity-70 cursor-pointer underline" onClick={(e) => { e.stopPropagation(); handleDateEdit(exp); }}>
                {exp.dueDate.toDate().toLocaleDateString()} 📅
              </p>
            </div>
            
            {/* Valores e Ações */}
            <div className="text-right">
              {exp.isVariable ? (
                <p className="font-bold text-xs cursor-pointer" onClick={() => {
                  const val = prompt("Edit spent amount:", String(exp.spentAmount || 0));
                  if (val !== null) updateDoc(doc(db, 'expenses', exp.id), { spentAmount: parseFloat(val) });
                }}>Plan: €{exp.plannedAmount.toFixed(2)} | Spent: €{(exp.spentAmount || 0).toFixed(2)}</p>
              ) : (
                <p className="font-bold text-xs">Plan: €{exp.plannedAmount.toFixed(2)}</p>
              )}
              
              <div className="flex gap-3 justify-end mt-1">
                <button onClick={() => handleDelete(exp)} className="text-red-400 text-lg">🗑️</button>
                <button onClick={() => handleTogglePaid(exp)} className="text-lg">
                  {exp.isPaid ? '✅' : '👍'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};