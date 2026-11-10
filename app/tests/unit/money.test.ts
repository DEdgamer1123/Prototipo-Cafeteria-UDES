import { describe, expect, it } from 'vitest';
import { esPrecioValido, formatCOP, fromCentavos, toCentavos } from '../../src/lib/money';

describe('money — COP entero y centavos solo en el borde', () => {
  it('convierte 12 000 COP a 1 200 000 centavos (caso literal del gateway)', () => {
    expect(toCentavos(12000)).toBe(1_200_000);
  });

  it('convierte 0 COP a 0 centavos', () => {
    expect(toCentavos(0)).toBe(0);
  });

  it('rechaza precios negativos', () => {
    expect(() => toCentavos(-1)).toThrow(RangeError);
  });

  it('rechaza precios con decimales (nunca floats para dinero)', () => {
    expect(() => toCentavos(12.5)).toThrow(RangeError);
    expect(esPrecioValido(12.5)).toBe(false);
  });

  it('rechaza precios por encima del máximo defensivo', () => {
    expect(() => toCentavos(500_001)).toThrow(RangeError);
  });

  it('hace el camino inverso sin pérdida', () => {
    expect(fromCentavos(1_200_000)).toBe(12000);
    expect(fromCentavos(0)).toBe(0);
  });

  it('rechaza centavos no múltiplos de 100', () => {
    expect(() => fromCentavos(1250)).toThrow(RangeError);
  });

  it('formatea en es-CO con COP y sin decimales', () => {
    const out = formatCOP(12000);
    expect(out).toContain('12');
    expect(out).toContain('000');
    expect(out).not.toContain(',00');
  });
});
