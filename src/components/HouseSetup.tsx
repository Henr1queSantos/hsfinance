import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const HouseSetup = () => {
  const { user, setHouseId } = useAuth();
  const [code, setCode] = useState('');

  const createHouse = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, 'houses', newCode), { members: [user?.uid], income: 0 });
    await setDoc(doc(db, 'users', user!.uid), { houseId: newCode }, { merge: true });
    setHouseId(newCode);
  };

  const joinHouse = async () => {
    const snap = await getDoc(doc(db, 'houses', code.toUpperCase()));
    if (snap.exists()) {
      await setDoc(doc(db, 'users', user!.uid), { houseId: code.toUpperCase() }, { merge: true });
      setHouseId(code.toUpperCase());
    } else alert("Code not found!");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Setup your Home</h2>
      <button onClick={createHouse} className="w-full bg-emerald-600 p-2 rounded">Create New House</button>
      <div className="flex gap-2">
        <input className="flex-1 p-2 bg-gray-700 rounded" placeholder="House Code" onChange={e => setCode(e.target.value)} />
        <button onClick={joinHouse} className="bg-blue-600 px-4 rounded">Join</button>
      </div>
    </div>
  );
};