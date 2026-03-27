'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type LobsterEvent = Database['public']['Tables']['lobster_events']['Row']

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function ActivityFeed({
  supabase,
  regionFilter,
}: {
  supabase: SupabaseClient<Database>
  regionFilter: 'KR' | 'US'
}) {
  const t = useTranslations('admin')
  const [events, setEvents] = useState<LobsterEvent[]>([])
  const [newEventId, setNewEventId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // CR-006: Fetch filtered by region, re-fetch on region change
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('lobster_events')
        .select('*')
        .eq('region', regionFilter)
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setEvents(data)
    }
    load()
  }, [supabase, regionFilter])

  // Realtime: new lobster events, filtered by region
  useEffect(() => {
    const channel = supabase
      .channel(`timeline-lobster-events-${regionFilter}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lobster_events' },
        (payload) => {
          const row = payload.new as LobsterEvent
          // CR-006: Only add events matching current region
          if (row.region !== regionFilter) return

          // CR-009: Clear animation after it plays
          setNewEventId(row.id)
          setTimeout(() => setNewEventId(null), 350)

          setEvents((prev) => [row, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, regionFilter])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#8892b0' }}>
          Timeline
        </h2>
        <span className="text-xs tabular-nums" style={{ color: '#8892b0' }}>
          {events.length}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span className="text-2xl opacity-40">{'\u{1F99E}'}</span>
            <p className="text-xs" style={{ color: '#8892b0' }}>
              {t('waitingForEvents')}
            </p>
          </div>
        ) : (
          <div className="relative pl-4">
            {/* Vertical line */}
            <div
              className="absolute left-[7px] top-2 bottom-2 w-px"
              style={{ background: 'rgba(230, 57, 70, 0.15)' }}
            />

            {events.map((event) => (
              <div
                key={event.id}
                className="relative mb-3 pl-5"
                style={{
                  animation: event.id === newEventId ? 'feedSlideIn 0.3s ease-out' : undefined,
                }}
              >
                {/* Dot */}
                <div
                  className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full"
                  style={{
                    background: '#E63946',
                    boxShadow: '0 0 6px rgba(230, 57, 70, 0.4)',
                  }}
                />

                <div className="flex items-start gap-2">
                  <span className="text-sm leading-tight">{'\u{1F99E}'}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-tight">
                      {event.team_name}
                    </span>
                    <span className="text-xs" style={{ color: '#E63946' }}>
                      {t('event_lobster_sent')}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: '#8892b0' }}>
                      {formatTime(event.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
