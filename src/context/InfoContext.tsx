// velog.io/@mjieun/Next.js-React-Context%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-%EC%83%81%ED%83%9C%EA%B4%80%EB%A6%AC%ED%95%98%EA%B8%B0
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { InfoContextType, Infos } from '@/types/chart_types';

const InfoContext = createContext<InfoContextType | undefined>(undefined);

export function InfoProvider({ children }: { children: ReactNode }) {
    const [name, setName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('');
    const [traceId, setTraceId] = useState<string>('');
    const [info, setInfo] = useState<Infos>({});

    return (
        <InfoContext.Provider
            value={{
                name,
                setName,
                userId,
                setUserId,
                sessionId,
                setSessionId,
                traceId,
                setTraceId,
                info,
                setInfo,
            }}
        >
            {children}
        </InfoContext.Provider>
    );
}

export function useInfo() {
    const context = useContext(InfoContext);
    if (context === undefined) {
        throw new Error('useInfo can only be used inside an InfoProvider');
    }
    return context;
}
