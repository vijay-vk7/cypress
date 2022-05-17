import type {
  CloudSpecRun,
} from '../src/gen/test-cloud-graphql-types.gen'
import type { CloudRunStatus } from '@packages/app/src/generated/graphql'

export const randomRunStatus: () => CloudRunStatus = () => {
  const r = Math.floor(Math.random() * 5)

  switch (r) {
    case 0: return 'CANCELLED'
    case 1: return 'ERRORED'
    case 2: return 'FAILED'
    case 3: return 'PASSED'
    default: return 'RUNNING'
  }
}

export function specDataAggregate (min: number | null = null, max: number | null = null) {
  return {
    __typename: 'SpecDataAggregate',
    min,
    max,
  } as const
}

export const fakeRuns: (statuses: CloudRunStatus[]) => CloudSpecRun[] = (statuses) => {
  return statuses.map((s, idx) => {
    return {
      __typename: 'CloudSpecRun' as const,
      id: `SpecRun_${idx}`,
      status: s,
      createdAt: new Date('2022-05-08T03:17:00').toISOString(),
      runNumber: 432,
      groupCount: 2,
      specDuration: specDataAggregate(
        143003, // 2:23
        159120, // 3:40
      ),
      testsFailed: specDataAggregate(1, 2),
      testsPassed: specDataAggregate(22, 23),
      testsSkipped: specDataAggregate(),
      testsPending: specDataAggregate(1, 2),
      url: 'https://google.com',
    }
  })
}

export const exampleRuns = () => {
  const runs = fakeRuns(['PASSED', 'FAILED', 'CANCELLED', 'ERRORED', 'NOTESTS', 'OVERLIMIT', 'RUNNING', 'TIMEDOUT'])

  const now = new Date()
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

  runs[1].groupCount = 1
  runs[1].testsFailed = { ...runs[1].testsFailed ?? {}, max: null }
  runs[1].testsPassed = { ...runs[1].testsPassed ?? {}, max: null }
  runs[1].testsPending = { ...runs[1].testsPending ?? {}, max: null }
  runs[1].specDuration = { min: 3760000, max: null }
  runs[1].testsFailed = { ...runs[1].testsFailed ?? {}, max: null }
  runs[1].createdAt = twoYearsAgo.toISOString()

  runs[2].createdAt = twoMonthsAgo.toISOString()
  runs[2].testsFailed = { ...runs[2].testsFailed ?? {}, max: runs[2].testsFailed?.min ?? null }

  runs[3].testsFailed = { ...runs[1].testsFailed ?? {}, max: 4358 }
  runs[3].testsPassed = { ...runs[1].testsPassed ?? {}, max: 4358 }
  runs[3].testsPending = { ...runs[1].testsPending ?? {}, max: 4358 }
  runs[3].testsSkipped = { min: 4, max: 4358 }
  runs[3].specDuration = { min: 3760000, max: 37600000 }
  runs[3].groupCount = 4358

  return runs
}
