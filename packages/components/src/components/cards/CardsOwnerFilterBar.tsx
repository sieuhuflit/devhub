import {
  Column,
  getFilteredItems,
  getItemsFilterMetadata,
  getOwnerAndRepoFormattedFilter,
  getUserAvatarByUsername,
  getUsernamesFromFilter,
} from '@devhub/core'
import _ from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { PixelRatio } from 'react-native'
import { useDispatch } from 'react-redux'

import { useColumn } from '../../hooks/use-column'
import { useColumnData } from '../../hooks/use-column-data'
import { useReduxState } from '../../hooks/use-redux-state'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import {
  cardsOwnerFilterBarTotalHeight,
  GenericOwnerFilterBar,
  GenericOwnerFilterBarProps,
  OwnerItemT,
} from './partials/GenericOwnerFilterBar'

export interface CardsOwnerFilterBarProps {
  columnId: Column['id']
  key: string
}

const ownersCacheByColumnId = new Map<string, Set<string>>()
const lastUsernameCacheByColumnId = new Map<string, string | undefined>()

export { cardsOwnerFilterBarTotalHeight }

export const CardsOwnerFilterBar = React.memo(
  (props: CardsOwnerFilterBarProps) => {
    const { columnId } = props

    const { column } = useColumn(columnId)
    const { allItems } = useColumnData(columnId)

    const dispatch = useDispatch()
    const plan = useReduxState(selectors.currentUserPlanSelector)

    const getFilteredItemsOptions = useMemo<
      Parameters<typeof getFilteredItems>[3]
    >(
      () => ({
        mergeSimilar: false,
        plan,
      }),
      [plan],
    )

    const { allForcedOwners, allForcedRepos, ownerFilters } = useMemo(
      () => getOwnerAndRepoFormattedFilter(column && column.filters),
      [column && column.filters],
    )

    const ownerOrRepoFilteredItemsMetadata = useMemo(
      () =>
        column &&
        getItemsFilterMetadata(
          column.type,
          getFilteredItems(
            column.type,
            allItems,
            {
              ...column.filters,
              owners: undefined,
            },
            getFilteredItemsOptions,
          ),
          {
            forceIncludeTheseOwners: allForcedOwners,
            forceIncludeTheseRepos: allForcedRepos,
            plan,
          },
        ),
      [
        column && column.type,
        allItems,
        column && column.filters,
        allForcedOwners,
        allForcedRepos,
        plan,
      ],
    )

    // on issues/prs column, reset owners list cache
    // if changed the usernames in the filters
    useMemo(() => {
      const newPreviousUsernameCacheValue =
        (column &&
          column.type === 'issue_or_pr' &&
          getUsernamesFromFilter('issue_or_pr', column.filters, {
            blacklist: ['owner'],
          }).includedUsernames[0]) ||
        undefined

      if (
        newPreviousUsernameCacheValue !==
        lastUsernameCacheByColumnId.get(columnId)
      ) {
        lastUsernameCacheByColumnId.set(columnId, newPreviousUsernameCacheValue)
        ownersCacheByColumnId.delete(columnId)
      }
    }, [
      columnId,
      column && column.type === 'issue_or_pr' ? allItems : undefined,
    ])

    let owners = Object.keys(
      (ownerOrRepoFilteredItemsMetadata &&
        ownerOrRepoFilteredItemsMetadata.owners) ||
        {},
    )
    owners = ownersCacheByColumnId.get(columnId)
      ? _.uniq(Array.from(ownersCacheByColumnId.get(columnId)!).concat(owners))
      : owners

    const data = owners
      .map((owner, index) => {
        const ownerItem =
          ownerOrRepoFilteredItemsMetadata &&
          ownerOrRepoFilteredItemsMetadata.owners[owner]

        if (column && column.type === 'issue_or_pr') {
          ownersCacheByColumnId.set(
            columnId,
            ownersCacheByColumnId.get(columnId) || new Set(),
          )
          ownersCacheByColumnId.get(columnId)!.add(owner)
        }

        return {
          avatarURL: getUserAvatarByUsername(
            owner,
            { baseURL: undefined },
            PixelRatio.getPixelSizeForLayoutSize,
          ), // TODO: baseURL
          hasUnread: !!(
            ownerItem &&
            ownerItem.metadata &&
            ownerItem.metadata.unread > 0
          ),
          value:
            ownerFilters && typeof ownerFilters[owner] === 'boolean'
              ? ownerFilters[owner]
              : null,
          owner,
          index,
        }
      })
      .filter(Boolean)
      .sort(
        column && column.type === 'issue_or_pr'
          ? () => 0
          : (a, b) =>
              a!.hasUnread && !b!.hasUnread
                ? -1
                : !a!.hasUnread && b!.hasUnread
                ? 1
                : 0,
      ) as OwnerItemT[]

    const onItemPress = useCallback<GenericOwnerFilterBarProps['onItemPress']>(
      (item, setOrReplace, value) => {
        if (setOrReplace === 'replace') {
          dispatch(
            actions.replaceColumnOwnerFilter({
              columnId,
              owner: value ? item.owner : null,
            }),
          )
        } else {
          dispatch(
            actions.setColumnOwnerFilter({
              columnId,
              owner: item.owner,
              value,
            }),
          )
          return
        }
      },
      [columnId],
    )

    const memoizedDataObjReference = useMemo(() => data, [JSON.stringify(data)])

    return (
      <GenericOwnerFilterBar
        data={memoizedDataObjReference}
        onItemPress={onItemPress}
      />
    )
  },
)

CardsOwnerFilterBar.displayName = 'CardsOwnerFilterBar'