export type CodigoError =
  | 'sin_sesion'
  | 'sin_permiso'
  | 'datos_invalidos'
  | 'no_encontrado'
  | 'red'
  | 'desconocido';

/** Error tipado de la capa de datos: mensaje en español + código estable. */
export class ApiError extends Error {
  readonly codigo: CodigoError;
  readonly causa?: unknown;

  constructor(codigo: CodigoError, mensaje: string, causa?: unknown) {
    super(mensaje);
    this.name = 'ApiError';
    this.codigo = codigo;
    this.causa = causa;
  }
}

type ErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

/** Traduce errores de Supabase/PostgREST a ApiError con mensaje accionable. */
export function mapSupabaseError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const e = (error ?? {}) as ErrorLike;
  const code = e.code ?? '';
  const raw = e.message ?? String(error ?? '');

  if (code === '42501' || /permission denied|row-level security/i.test(raw)) {
    return new ApiError('sin_permiso', 'No tienes permiso para realizar esta acción.', error);
  }
  if (code === 'PGRST116' || /0 rows|multiple \(or no\) rows/i.test(raw)) {
    return new ApiError('no_encontrado', 'No encontramos ese registro.', error);
  }
  if (code === '22023' || code === 'P0001' || code === '23505') {
    return new ApiError('datos_invalidos', raw || 'Los datos enviados no son válidos.', error);
  }
  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return new ApiError('red', 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', error);
  }
  if (/jwt|session|auth/i.test(raw)) {
    return new ApiError('sin_sesion', 'Tu sesión expiró. Vuelve a iniciar sesión.', error);
  }

  return new ApiError('desconocido', 'Ocurrió un error inesperado. Inténtalo de nuevo.', error);
}
