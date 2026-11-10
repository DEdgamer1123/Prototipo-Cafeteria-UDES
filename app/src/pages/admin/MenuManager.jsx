import { useState } from 'react';
import { Package, ImagePlus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP, CATEGORIES } from '../../data/menu';
import Modal from '../../components/Modal';

const EMPTY = { name: '', description: '', price: '', stock: 10, category: 'almuerzos', image: '', available: true };

// CRUD de productos (formulario minimo en modal — Ley de Hick)
export default function MenuManager() {
  const { products, saveProduct, deleteProduct, toggleAvailable, showToast } = useStore();
  const [form, setForm] = useState(null); // null = modal cerrado

  const openNew = () => setForm({ ...EMPTY });
  const openEdit = (p) => setForm({ ...p });

  const submit = (e) => {
    e.preventDefault();
    const product = {
      ...form,
      price: Number(form.price),
      stock: Math.max(0, Number(form.stock) || 0),
      isLunch: form.category === 'almuerzos',
      image: form.image || `https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70`,
    };
    saveProduct(product);
    showToast(form.id ? 'Producto actualizado' : 'Producto creado');
    setForm(null);
  };

  // Sube o toma una foto: se redimensiona (max 600px) y se guarda en
  // Base64 para que quepa en localStorage (prototipo sin backend)
  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 600 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setForm((f) => ({ ...f, image: canvas.toDataURL('image/jpeg', 0.8) }));
        showToast('Imagen lista', 'info');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-udes-blue">Gestión del menú</h1>
          <p className="text-sm text-slate-600">{products.length} productos</p>
        </div>
        <button onClick={openNew} className="rounded-full bg-udes-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-udes-blue-dark">
          + Nuevo producto
        </button>
      </div>

      {form && (
        <Modal title={form.id ? 'Editar producto' : 'Nuevo producto'} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="space-y-4" aria-label={form.id ? 'Editar producto' : 'Nuevo producto'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="f-name" className="mb-1 block text-sm font-semibold">Nombre *</label>
                <input id="f-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-desc" className="mb-1 block text-sm font-semibold">Descripción</label>
                <input id="f-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
              </div>
              <div>
                <label htmlFor="f-price" className="mb-1 block text-sm font-semibold">Precio (COP) *</label>
                <input id="f-price" required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
              </div>
              <div>
                <label htmlFor="f-stock" className="mb-1 block text-sm font-semibold">Stock disponible *</label>
                <input id="f-stock" required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-cat" className="mb-1 block text-sm font-semibold">Categoría *</label>
                <select id="f-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold">Imagen del producto</span>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <img src={form.image} alt="Vista previa del producto" className="h-16 w-16 rounded-xl object-cover" />
                  )}
                  {/* En celular, accept+capture ofrece "Tomar foto" directamente */}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-udes-blue-light px-4 py-2.5 text-sm font-bold text-udes-blue hover:bg-udes-blue hover:text-white">
                    <ImagePlus size={16} aria-hidden="true" />
                    Subir o tomar foto
                    <input type="file" accept="image/*" capture="environment" onChange={pickImage} className="sr-only" />
                  </label>
                </div>
                <label htmlFor="f-img" className="mb-1 mt-3 block text-sm font-semibold">o pega una URL de imagen</label>
                <input id="f-img" type="url" value={form.image.startsWith('data:') ? '' : form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-udes-blue px-6 py-2.5 font-bold text-white hover:bg-udes-blue-dark">Guardar</button>
              <button type="button" onClick={() => setForm(null)} className="rounded-full border border-slate-300 px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      <ul className="space-y-3 p-0">
        {products.map((p) => {
          const outOfStock = (p.stock ?? 0) <= 0;
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-card bg-white p-4 shadow-card">
              <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-40 flex-1">
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {CATEGORIES.find((c) => c.id === p.category)?.label} · {formatCOP(p.price)}
                </p>
              </div>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  outOfStock ? 'bg-danger-light text-danger' : p.stock <= 3 ? 'bg-warning-light text-warning' : 'bg-slate-100 text-slate-600'
                }`}
                aria-label={`Stock: ${p.stock ?? 0} unidades`}
              >
                <Package size={14} aria-hidden="true" />
                {outOfStock ? 'Sin stock' : `${p.stock} uds`}
              </span>
              <button
                onClick={() => { toggleAvailable(p.id); showToast(p.available ? `"${p.name}" agotado` : `"${p.name}" disponible`, 'info'); }}
                aria-pressed={p.available}
                className={`rounded-full px-4 py-2.5 text-xs font-bold ${p.available ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}
              >
                {p.available ? 'Disponible' : 'Agotado'}
              </button>
              <button onClick={() => openEdit(p)} className="rounded-full bg-udes-blue-light px-4 py-2.5 text-xs font-bold text-udes-blue hover:bg-udes-blue hover:text-white">
                Editar
              </button>
              <button onClick={() => { deleteProduct(p.id); showToast('Producto eliminado', 'warning'); }} className="rounded-full bg-danger-light px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger hover:text-white">
                Eliminar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
