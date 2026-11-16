import assert from 'node:assert/strict';
import test from 'node:test';
import { amanha, formatarData, futuro } from '../../data/horarios.js';

test('vaga das 10h de São Paulo é futura às 09h30 e fecha às 10h', t => {
  const vaga = { data: '2026-11-05', hora: '10:00' };
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-05T12:30:00Z') });

  assert.equal(futuro(vaga), true);
  t.mock.timers.tick(30 * 60 * 1000);
  assert.equal(futuro(vaga), false);
});

test('data sugerida segue a virada de ano de São Paulo', t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2027-01-01T02:30:00Z') });

  assert.equal(amanha(), '2027-01-01');
  t.mock.timers.tick(30 * 60 * 1000);
  assert.equal(amanha(), '2027-01-02');
  assert.equal(formatarData('2027-01-01'), 'sexta-feira, 01 de janeiro');
});
