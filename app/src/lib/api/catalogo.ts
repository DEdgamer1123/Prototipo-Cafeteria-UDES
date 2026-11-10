import { getSupabase } from '../supabase';
import { ApiError, mapSupabaseError } from './errores';
import type { Database } from '../database.types';

export type Producto = Database['public']['Tables']['productos']['Row'];
export type Cafeteria = Database['public']['Tables']['cafeterias']['Row'];
export type Slot = Database['public']['Tables']['slots']['Row'];
export type Franja = Database['public']['Functions']['franjas_disponibles']['Returns'][number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function esUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

/** Cafeterías activas; el estudiante elige una antes de ver el menú. */
export async function listarCafeterias(): Promise<Cafeteria[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('cafeterias')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) throw mapSupabaseError(error);
  return data ?? [];
}

/**
 * Productos disponibles para una cafetería.
 * `cafeteriaId` null => catálogo base (productos sin cafetería asignada).
 */
export async function listarProductos(
  cafeteriaId: string | null,
  categoria?: Producto['categoria']
): Promise<Producto[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('productos')
    .select('*')
    .eq('disponible', true)
    .order('nombre', { ascending: true });

  if (categoria) query = query.eq('categoria', categoria);

  if (cafeteriaId) {
    if (!esUuid(cafeteriaId)) throw new ApiError('datos_invalidos', 'Cafetería inválida.');
    query = query.or(`cafeteria_id.is.null,cafeteria_id.eq.${cafeteriaId}`);
  } else {
    query = query.is('cafeteria_id', null);
  }

  const { data, error } = await query;
  if (error) throw mapSupabaseError(error);
  return data ?? [];
}

/** Franjas configuradas por cafetería (sin cálculo de cupo). */
export async function listarSlots(cafeteriaId: string): Promise<Slot[]> {
  if (!esUuid(cafeteriaId)) throw new ApiError('datos_invalidos', 'Cafetería inválida.');
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('cafeteria_id', cafeteriaId)
    .eq('activo', true)
    .order('hora', { ascending: true });

  if (error) throw mapSupabaseError(error);
  return data ?? [];
}

/**
 * Franjas con cupo restante y bloqueo por tiempo estimado (servidor).
 * Una franja con `bloqueada = true` no debe poder seleccionarse.
 */
export async function franjasDisponibles(cafeteriaId: string): Promise<Franja[]> {
  if (!esUuid(cafeteriaId)) throw new ApiError('datos_invalidos', 'Cafetería inválida.');
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('franjas_disponibles', {
    p_cafeteria_id: cafeteriaId,
  });

  if (error) throw mapSupabaseError(error);
  return data ?? [];
}

/** Stock realmente disponible (físico − reservado). */
export function disponibleDe(p: Pick<Producto, 'stock' | 'stock_reservado'>): number {
  return Math.max(0, p.stock - p.stock_reservado);
}
