import React from 'react'
import type { PrebidData } from '@/shared/types/prebid'
import {
  PrebidHeader,
  PrebidTimeline,
  WinningBids,
  BiddersTable,
  AdUnits,
  PrebidConfig,
  PrebidModules,
  UserIds,
  ConsentStatus,
  BidderAliases,
  BidderSettings,
  AdServerTargeting,
} from './prebid'

interface PrebidSectionProps {
  data: PrebidData
  headerAction: React.ReactNode
  headerContent: React.ReactNode
}

export const PrebidSection: React.FC<PrebidSectionProps> = ({ data, headerAction, headerContent }) => {
  return (
    <>
      {/* Header with stats */}
      <PrebidHeader data={data} action={headerAction} />
      {headerContent}

      {/* Event Timeline - 重要なので2番目 */}
      <PrebidTimeline events={data.events} />

      {/* Winning Bids */}
      <WinningBids bids={data.winningBids} title="Winning Bids" variant="won" />

      {/* Prebid Winners (Pending) */}
      <WinningBids bids={data.prebidWinningBids} title="Prebid Winners (Pending)" variant="pending" />

      {/* Bidders Performance Table */}
      <BiddersTable bidders={data.bidders} />

      {/* Ad Units */}
      <AdUnits adUnits={data.adUnits} />

      {/* Configuration */}
      <PrebidConfig config={data.config} />

      {/* Installed Modules */}
      <PrebidModules modules={data.installedModules} />

      {/* User IDs */}
      <UserIds userIds={data.userIds} />

      {/* Consent Status */}
      <ConsentStatus consent={data.consentMetadata} />

      {/* Bidder Aliases */}
      <BidderAliases aliases={data.aliasRegistry} />

      {/* Bidder Settings */}
      <BidderSettings settings={data.bidderSettings} />

      {/* Ad Server Targeting */}
      <AdServerTargeting targeting={data.adserverTargeting} />
    </>
  )
}
