import React from 'react'
import type { UserIdInfo } from '@/shared/types/prebid'
import { IconTouch as IconFingerprint } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface UserIdsProps {
  userIds: UserIdInfo | null
}

export const UserIds: React.FC<UserIdsProps> = ({ userIds }) => {
  if (!userIds || Object.keys(userIds.ids).length === 0) return null

  return (
    <Section title="User IDs" icon={<IconFingerprint size={14} />} count={Object.keys(userIds.ids).length}>
      <div className="space-y-1.5">
        {Object.entries(userIds.ids).map(([key, value]) => (
          <div key={key} className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-medium mb-0.5">{key}</div>
            <div className="whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
              {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
