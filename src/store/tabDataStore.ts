import { create } from 'zustand'
import type { SeoData, PrebidData, GptData, GtmData, AnalyticsData, TechStackData } from '@/shared/types'

export type DataCollectionStatus = 'connecting' | 'loading' | 'ready' | 'error'

interface TabDataState {
  seoData: SeoData | null
  prebidData: PrebidData | null
  gptData: GptData | null
  gtmData: GtmData | null
  analyticsData: AnalyticsData | null
  techStackData: TechStackData | null
  status: DataCollectionStatus
  currentTabId: number | null
}

interface TabDataActions {
  setSeoData: (data: SeoData | null) => void
  setPrebidData: (data: PrebidData | null) => void
  setGptData: (data: GptData | null) => void
  setGtmData: (data: GtmData | null) => void
  setAnalyticsData: (data: AnalyticsData | null) => void
  setTechStackData: (data: TechStackData | null) => void
  setStatus: (status: DataCollectionStatus) => void
  setCurrentTabId: (tabId: number | null) => void
  resetData: () => void
  applyCache: (cache: Partial<TabDataState>) => void
}

const initialDataState: TabDataState = {
  seoData: null,
  prebidData: null,
  gptData: null,
  gtmData: null,
  analyticsData: null,
  techStackData: null,
  status: 'connecting',
  currentTabId: null,
}

export const useTabDataStore = create<TabDataState & TabDataActions>((set) => ({
  ...initialDataState,

  setSeoData: (data) => set({ seoData: data }),
  setPrebidData: (data) => set({ prebidData: data }),
  setGptData: (data) => set({ gptData: data }),
  setGtmData: (data) => set({ gtmData: data }),
  setAnalyticsData: (data) => set({ analyticsData: data }),
  setTechStackData: (data) => set({ techStackData: data }),
  setStatus: (status) => set({ status }),
  setCurrentTabId: (tabId) => set({ currentTabId: tabId }),

  // タブ切替・リロード時にデータをリセット
  resetData: () =>
    set({
      seoData: null,
      prebidData: null,
      gptData: null,
      gtmData: null,
      analyticsData: null,
      techStackData: null,
    }),

  // GET_TAB_DATA のキャッシュを一括適用
  applyCache: (cache) =>
    set({
      seoData: cache.seoData ?? null,
      prebidData: cache.prebidData ?? null,
      gptData: cache.gptData ?? null,
      gtmData: cache.gtmData ?? null,
      analyticsData: cache.analyticsData ?? null,
      techStackData: cache.techStackData ?? null,
    }),
}))
