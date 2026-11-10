// Pantallas de carga esqueleto (mejoran percepcion de velocidad)
export function SkeletonCard() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-card bg-white shadow-card">
      <div className="skeleton h-40 rounded-none sm:h-48" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-8 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 rounded-card bg-white p-4 shadow-card">
      <div className="skeleton h-14 w-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  );
}
