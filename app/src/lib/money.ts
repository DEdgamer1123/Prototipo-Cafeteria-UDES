/**
 * money.ts — única fuente de verdad del dinero en UDES Food.
 *
 * Canónico: COP entero (sin centavos, sin floats).
 * `monto_centavos = monto * 100` se aplica SOLO en el borde del gateway
 * (Wompi exige `amount_in_cents`). En cualquier otro lugar se usa COP entero.
 */

/** Límite superior defensivo para un precio unitario (COP). */
export const PRECIO_MAX_COP = 500_000;

/** Valida que un valor sea un precio entero en COP dentro de rango. */
export function esPrecioValido(n: unknown): n is number {
  return (
    typeof n === 'number' &&
    Number.isFinite(n) &&
    Number.isInteger(n) &&
    n >= 0 &&
    n <= PRECIO_MAX_COP
  );
}

/** Convierte COP enteros a centavos. Solo para el borde del gateway. */
export function toCentavos(cop: number): number {
  if (!esPrecioValido(cop)) {
    throw new RangeError(`Precio inválido: ${String(cop)} (debe ser entero entre 0 y ${PRECIO_MAX_COP} COP)`);
  }
  return cop * 100;
}

/** Convierte centavos a COP enteros. Lanza si no es divisible por 100. */
export function fromCentavos(centavos: number): number {
  if (!Number.isInteger(centavos) || centavos < 0 || centavos % 100 !== 0) {
    throw new RangeError(`Centavos inválidos: ${String(centavos)} (entero ≥ 0 y múltiplo de 100)`);
  }
  return centavos / 100;
}

/** Formato visible para el usuario: $ 12.000 (es-CO, COP, 0 decimales). */
export function formatCOP(n: number): string {
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}
