<template>
  <div
    class="flex flex-col p-4 gap-2 items-center"
    :class="statusColor"
  >
    <div class="font-semibold text-gray-800">
      Run #{{ props.gql.runNumber }}
    </div>
    <div class="max-w-80 text-gray-600 truncate overflow-hidden">
      {{ props.specFile }}
    </div>
    <div class="flex flex-row text-gray-600 text-size-14px gap-2 items-center">
      <div
        v-if="statusText"
        :class="'text-'+statusColor"
        class="font-medium"
      >
        {{ statusText }}
      </div>
      <i-cy-dot-solid_x4
        v-if="statusText"
        width="4px"
        height="4px"
        class="icon-light-gray-400"
      />
      <div v-if="props.gql.createdAt">
        {{ getTimeAgo(props.gql.createdAt) }}
      </div>
      <i-cy-dot-solid_x4
        width="4px"
        height="4px"
        class="icon-light-gray-400"
      />
      <div>{{ groupText }}</div>
      <i-cy-dot-solid_x4
        width="4px"
        height="4px"
        class="icon-light-gray-400"
      />
      <div>{{ getAggDurationString(props.gql.specDuration ?? {}) }}</div>
    </div>
    <ResultCounts
      v-if="runResults"
      v-bind="runResults"
      class="my-2"
    />
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import type { SpecRunSummaryFragment } from '../generated/graphql'
import ResultCounts, { ResultCountsProps } from '@packages/frontend-shared/src/components/ResultCounts.vue'
import { getTimeAgo, getDurationString } from '@packages/frontend-shared/src/utils/time'
import { gql } from '@urql/vue'
import type { SpecDataAggregate } from '../../../graphql/src/gen/cloud-source-types.gen'

gql`
fragment SpecRunSummary on CloudSpecRun {
  id
  status
  runNumber
  testsFailed {
    min
    max
  }
  testsPassed {
    min
    max
  }
  testsPending {
    min
    max
  }
  testsSkipped {
    min
    max
  }
  createdAt
  groupCount
  specDuration {
    min
    max
  }
}
`

const props = withDefaults(defineProps<{
  gql: SpecRunSummaryFragment
  specFile: string|null
}>(), {
  specFile: null,
})

const getAggregateTestCountString = (agg: SpecDataAggregate) => {
  if (agg.min == null) return '0'

  if (!agg.max || agg.min === agg.max) return agg.min

  return `${agg.min}-${agg.max}`
}

const getAggDurationString = (agg: SpecDataAggregate) => {
  if (agg.min == null) return '--'

  // since agg.min and agg.max are in milliseconds, we want to make sure the
  // user won't get a string like "2 - 2" for {min: 2003, max: 2010}
  if (!agg.max || Math.round(agg.min / 1000) === Math.round(agg.max / 1000)) return getDurationString(agg.min)

  return `${getDurationString(agg.min)} - ${getDurationString(agg.max)}`
}

const runResults = computed(() => {
  if (!props.gql) return null

  return {
    id: props.gql.id,
    totalFailed: getAggregateTestCountString(props.gql.testsFailed ?? {}),
    totalPassed: getAggregateTestCountString(props.gql.testsPassed ?? {}),
    totalPending: getAggregateTestCountString(props.gql.testsPending ?? {}),
    totalSkipped: getAggregateTestCountString(props.gql.testsSkipped ?? {}),
  } as ResultCountsProps
})

const groupText = computed(() => {
  if (!props.gql) return null

  if (props.gql.groupCount === 1) return '1 group'

  return `${props.gql.groupCount } groups`
})

const statusText = computed(() => {
  if (!props.gql?.status) return null

  switch (props.gql.status) {
    case 'CANCELLED': return 'Cancelled'
    case 'ERRORED': return 'Errored'
    case 'FAILED': return 'Failed'
    case 'NOTESTS': return 'No tests'
    case 'OVERLIMIT': return 'Over limit'
    case 'PASSED': return 'Passed'
    case 'RUNNING': return 'Running'
    case 'TIMEDOUT': return 'Timed out'
    default: return null
  }
})

const statusColor = computed(() => {
  if (!props.gql?.status) return 'gray-700'

  switch (props.gql.status) {
    case 'OVERLIMIT':
    case 'ERRORED':
    case 'TIMEDOUT':
      return 'orange-500'
    case 'FAILED':
      return 'red-500'
    case 'PASSED':
      return 'jade-500'
    case 'RUNNING':
      return 'indigo-700'
    case 'CANCELLED':
    case 'NOTESTS':
    default: return 'gray-700'
  }
})

</script>

<style lang="scss" scoped>
.orange-500 {
    border-top: 4px solid $orange-500 !important;
}
.red-500 {
    border-top: 4px solid $red-500 !important;
}
.jade-500 {
    border-top: 4px solid $jade-500 !important;
}
.indigo-700 {
    border-top: 4px solid $indigo-700 !important;
}
.gray-700 {
    border-top: 4px solid $gray-700 !important;
}
</style>
