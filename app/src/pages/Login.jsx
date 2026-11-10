import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoVertical from '../assets/logo-escudo.png';
import Footer from '../components/Footer';

// Login visual (prototipo): cualquier correo valido entra.
// Correo admin@udes.edu.co entra como administrador.
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo institucional válido.');
      return;
    }
    const isAdmin = email.toLowerCase().startsWith('admin');
    onLogin({ name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'student' });
    navigate(isAdmin ? '/admin' : '/menu');
  };

  return (
    <div className="flex min-h-dvh flex-col">
    <main className="flex flex-1 items-center justify-center bg-udes-blue-light p-4 py-8 md:items-start md:pt-[10vh]">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-pop sm:max-w-lg md:max-w-xl md:p-10">
        <div className="mb-6 flex flex-col items-center">
          <img src={logoVertical} alt="Escudo Universidad de Santander" className="h-40 w-auto md:h-48" />
          <h1 className="mt-4 text-2xl font-extrabold text-udes-blue md:text-3xl">
            UDES <span className="text-udes-gold-dark">Food</span>
          </h1>
          <p className="mt-1 text-center text-sm text-slate-600 md:text-base">
            Ordena, paga y recoge tu comida en la cafetería, sin filas.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold">
              Correo institucional
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="nombre@udes.edu.co"
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : undefined}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-udes-blue"
            />
            {error && (
              <p id="email-error" role="alert" className="mt-1 text-sm font-semibold text-danger">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-udes-blue py-3 font-bold text-white transition-colors duration-fast hover:bg-udes-blue-dark"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Demo: usa <strong>admin@udes.edu.co</strong> para entrar al panel de administración.
        </p>
      </div>
    </main>
    <Footer />
    </div>
  );
}
