import { describe, expect, it } from 'vitest'
import { BREAKS } from './registry'
import type { BreakSpec } from '../components/BreakStage'

/**
 * A Break-it sandbox makes two promises, and both are easy to get wrong.
 *
 * The first is that it starts healthy: if a probe already fails before the
 * learner touches anything, every lesson after that is noise. The second is
 * that every switch does something — a fault that leaves all the probes green
 * teaches nothing, and the learner has no way to tell it is the lab at fault
 * rather than their own understanding.
 *
 * Reverting has to put it back exactly, too, or faults silently accumulate as
 * the learner flips switches back and forth.
 */

const probeResults = (spec: BreakSpec, net: ReturnType<BreakSpec['build']>) =>
  spec.probes.map((p) => net.ping(p.from, p.destIp).ok)

describe.each(Object.entries(BREAKS))('break-it sandbox %s', (id, spec) => {
  it('starts exactly as healthy as it claims', () => {
    const net = spec.build()
    const failing = spec.probes
      .filter((p) => !net.ping(p.from, p.destIp).ok)
      .map((p) => p.id)
    expect(
      failing.sort(),
      `${id}: probes failing at the start should match startsFailing`,
    ).toEqual([...(spec.startsFailing ?? [])].sort())
  })

  it('has at least one fault and one probe', () => {
    expect(spec.actions.length, `${id} has no faults`).toBeGreaterThan(0)
    expect(spec.probes.length, `${id} has no probes`).toBeGreaterThan(0)
  })

  it.each(spec.actions.map((a) => [a.id, a] as const))(
    'fault %s does what it says',
    (actionId, action) => {
      const net = spec.build()
      const before = probeResults(spec, net)
      action.apply(net)
      const after = probeResults(spec, net)
      if (action.silent) {
        expect(
          after,
          `${id}/${actionId}: marked silent, but it did change a probe`,
        ).toEqual(before)
      } else {
        expect(
          after,
          `${id}/${actionId}: flipping this changed nothing, so it teaches nothing`,
        ).not.toEqual(before)
      }
    },
  )

  it.each(spec.actions.map((a) => [a.id, a] as const))(
    'fault %s reverts cleanly',
    (actionId, action) => {
      const net = spec.build()
      const before = probeResults(spec, net)
      action.apply(net)
      action.revert(net)
      expect(
        probeResults(spec, net),
        `${id}/${actionId}: reverting did not restore the network`,
      ).toEqual(before)
    },
  )
})
