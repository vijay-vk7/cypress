import SpecRunSummary from './SpecRunSummary.vue'
import { SpecRunSummaryFragmentDoc } from '../generated/graphql-test'

describe('<SpecRunSummary />', { keystrokeDelay: 0 }, () => {
  it('playground', { viewportHeight: 800, viewportWidth: 900 }, () => {
    const specsByIndex = [
      'bankaccounts.spec.ts',
      'singleGroup.spec.ts',
      'noRangeForFailed.spec.ts',
      'veryVeryVeryVeryVeryVeryVeryVeryVeryLongSpecFileName.spec.ts',
    ]

    cy.mountFragmentList(SpecRunSummaryFragmentDoc, {
      count: 4,
      onResult (result) {
        return result.map((result) => ({ ...result, status: 'FAILED' as const }))
      },
      render (frag) {
        return (
          <div class="flex gap-2">
            <div class="flex flex-col p-4 gap-y-15px">
              {frag.map((run, i) => {
                return <SpecRunSummary gql={run} specFile={specsByIndex[i]} />
              })}
            </div>
            <div class="flex flex-col p-4 gap-y-15px">
              {frag.map((run, i) => {
                return <SpecRunSummary gql={run} specFile={specsByIndex[i]} />
              })}
            </div>
          </div>
        )
      },
    })
  })
})
