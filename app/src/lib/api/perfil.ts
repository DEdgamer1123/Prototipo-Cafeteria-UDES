import { getSupabase } from '../supabase';
import { ApiError, mapSupabaseError } from './errores';

export type Perfil = {
  id: string;
  codigo: string;
  nombre_completo: string;
  correo: string;
  rol: 'student' | 'admin';
  activo: boolean;
};

export type SesionActual = {
  userId: string | null;
  email: string | null;
  perfil: Perfil | null;
};

/** Perfil del usuario autenticado (vía `estudiantes.user_id`). Sin sesión => null. */
export async function obtenerMiPerfil(): Promise<Perfil | null> {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw mapSupabaseError(authError);
  if (!user) return null;

  const { data, error } = await supabase
    .from('estudiantes')
    .select('id,codigo,nombre_completo,correo,rol,activo')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw mapSupabaseError(error);
  return (data as Perfil | null) ?? null;
}

/** Sesión + perfil en una sola lectura (para guards y shell). */
export async function obtenerSesionActual(): Promise<SesionActual> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, email: null, perfil: null };

  const perfil = await obtenerMiPerfil();
  return { userId: user.id, email: user.email ?? null, perfil };
}

/**
 * Registra el consentimiento expreso (una fila por versión; el historial no se
 * sobrescribe). La IP y el user-agent se capturan en el servidor cuando el
 * endpoint lo permita; desde el cliente se registra versión + fecha.
 */
export async function registrarConsentimiento(versionPolitica: string): Promise<void> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError('sin_sesion', 'Debes iniciar sesión para registrar el consentimiento.');
  }

  const { error } = await supabase.from('consentimientos').insert({
    estudiante_id: user.id,
    version_politica: versionPolitica,
    aceptado: true,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
  });

  if (error) throw mapSupabaseError(error);
}
