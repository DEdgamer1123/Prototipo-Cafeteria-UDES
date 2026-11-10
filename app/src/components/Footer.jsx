import logoAlt from '../assets/logo-alt.png';

// Footer institucional con el logo horizontal de la UDES
const YEAR = new Date().getFullYear(); // fuera del render (pureza del componente)

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <img src={logoAlt} alt="Universidad de Santander UDES" className="h-10 w-auto object-contain sm:h-12" />
        <p className="text-xs text-slate-500 sm:text-sm">
          © {YEAR} Universidad de Santander · <span className="font-semibold text-udes-blue">UDES Food</span> — prototipo académico
        </p>
      </div>
    </footer>
  );
}
