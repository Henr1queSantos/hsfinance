import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { HouseSetup } from './components/HouseSetup';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebase';

function App() {
  const { user, houseId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!houseId) return;
    
    getDoc(doc(db, 'houses', houseId)).then(d => d.exists() && setIncome(d.data().income || 0));

    const q = query(collection(db, 'expenses'), where('houseId', '==', houseId));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const filtered = data.filter(e => {
        const d = e.dueDate.toDate();
        return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
      });
      setExpenses(filtered);
    });
  }, [houseId, viewDate]);

  const totalPlanned = expenses.reduce((a, e) => a + (e.plannedAmount || 0), 0);
  const totalSpent = expenses.reduce((a, e) => (e.isPaid ? a + (e.spentAmount || 0) : a), 0);
  const stillToPay = expenses.reduce((a, e) => (!e.isPaid ? a + (e.plannedAmount || 0) : a), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-lg mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-500">HS Expenses</h1>
      </header>

      {!user ? <LoginForm /> : !houseId ? <HouseSetup /> : (
        <>
          <div className="text-[9px] text-gray-600 text-center uppercase tracking-widest cursor-pointer opacity-50 mb-2" 
               onClick={() => navigator.clipboard.writeText(houseId)}>
            House Code: {houseId} (Click to copy)
          </div>

          <div className="bg-gray-800 p-4 rounded-xl mb-4 text-xs space-y-2 border border-gray-700">
            <div className="flex justify-between items-center">
              <span>Total Income:</span>
              <input type="number" className="bg-gray-700 w-20 text-right px-1 rounded" value={income} 
                onChange={(e) => { 
                  const val = parseFloat(e.target.value);
                  setIncome(val); 
                  setDoc(doc(db, 'houses', houseId), { income: val }, { merge: true }); 
                }} 
              />
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span>Total Planned:</span> <span>€{totalPlanned.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Total Spent:</span> <span>€{totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Still To Pay:</span> <span>€{stillToPay.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-gray-700 pt-2">
              <span>Budget Remaining:</span> <span>€{(income - totalSpent).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 text-sm font-bold">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>◀</button>
            <h2>{viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>▶</button>
          </div>

          {showForm ? <ExpenseForm onComplete={() => setShowForm(false)} /> : (
  <>
    <div className="pb-24">
      <ExpenseList expenses={expenses} />
    </div>

    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
      <button 
        onClick={() => setShowForm(true)} 
        className="bg-emerald-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold"
      >
        +
      </button>
    </div>
  </>
)}
        </>
      )}
    </div>
  );
}

export default App;