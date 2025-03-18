'use client';

import { useEffect, useState } from 'react';
import Contents from '@/components/content';
import { useInfo } from '@/context/InfoContext';

export default function Home() {
    const fetchInterval: number = 600000;
    const {
        name,
        userId,
        sessionId,
        traceId,
        info,
        setName,
        setUserId,
        setSessionId,
        setTraceId,
        setInfo,
    } = useInfo();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL('/langfuse/info', window.location.origin);
                const response = await fetch(url.toString());
                if (response.ok) {
                    let result;
                    try {
                        result = await response.json();
                    } catch (jsonError) {
                        console.error('Error fetching json:', jsonError);
                        setInfo({});
                    }
                    setInfo(result);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, fetchInterval);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <div className="flex justify-center gap-4">
                <span className="rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-gray-500/10">
                    Project Name: {name}
                </span>
                <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-red-600/10">
                    User ID: {userId}
                </span>
                <span className="rounded-md bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-800 ring-1 ring-yellow-600/10">
                    Session ID: {sessionId}
                </span>
                <span>
                    <select
                        value={traceId}
                        onChange={(e) => {
                            const selectedTraceId = e.target.value;
                            setTraceId(selectedTraceId);

                            if (selectedTraceId && info[selectedTraceId]) {
                                const traceInfo = info[selectedTraceId];
                                setName(traceInfo.name || '');
                                setUserId(traceInfo.userId || '');
                                setSessionId(traceInfo.sessionId || '');
                            } else {
                                setName('');
                                setUserId('');
                                setSessionId('');
                            }
                        }}
                        className="py-1 px-2 block max-w-48 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    >
                        <option value="">Select Trace ID</option>
                        {Object.keys(info).map((id, index) => (
                            <option key={index} value={id}>
                                {id}
                            </option>
                        ))}
                    </select>
                </span>
            </div>
            <main
                //  h-[30rem]     브라우저 너비 640px 미만일 때
                //  sm:h-[35rem]  브라우저 너비 640px 이상일 때
                //  lg:h-[40rem]  브라우저 너비 1024px 이상일 때
                //  xl:h-[45rem]  브라우저 너비 1280px 이상일 때
                //  2xl:h-[50rem] 브라우저 너비 1536px 이상일 때
                className="graphs-scrollbar overflow-y-scroll h-[30rem] sm:h-[35rem] lg:h-[40rem] xl:h-[45rem] 2xl:h-[50rem]"
            >
                <Contents />
            </main>
        </>
    );
}
