'use client';

import { create } from 'zustand';
import type { InfoState } from '@/types/chartTypes';

export const useInfoStore = create<InfoState>((set) => ({
    name: '',
    setName: (name) => set({ name }),
    userId: '',
    setUserId: (userId) => set({ userId }),
    sessionId: '',
    setSessionId: (sessionId) => set({ sessionId }),
    traceId: '',
    setTraceId: (traceId) => set({ traceId }),
    info: {},
    setInfo: (info) => set({ info }),
}));
