import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Erro ao autenticar: " + error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 bg-gray-800 p-6 rounded shadow-lg">
      <input type="email" placeholder="Email" className="w-full p-2 mb-4 bg-gray-700 rounded text-white" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="w-full p-2 mb-4 bg-gray-700 rounded text-white" onChange={e => setPassword(e.target.value)} />
      <button type="submit" className="w-full bg-emerald-600 p-2 rounded font-bold hover:bg-emerald-500">
        {isRegistering ? 'Register' : 'Sign In'}
      </button>
      <button type="button" className="w-full mt-4 text-sm text-gray-400" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
      </button>
    </form>
  );
};