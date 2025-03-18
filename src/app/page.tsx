'use client';

import { useEffect, useState } from 'react';
import Contents from '@/components/content';
import type { Infos } from '@/types/chart_types';

export default function Home() {
    const height = 410;
    const titlefontSize = 20;

    const [info, setInfo] = useState<Infos>({});
    const [name, setName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [traceId, setTraceId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL('/langfuse/info', window.location.origin);
                const response = await fetch(url.toString());
                if (response.ok) {
                    let result;
                    try {
                        result = await response.json();
                    } catch (jsonError) {}
                    setInfo(result);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
        // 컴포넌트가 마운트될 때 인터벌 설정
        const intervalId = setInterval(() => {
            fetchData();
        }, 600000); // 600초(10분)마다 fetchData 함수 호출

        // 컴포넌트가 언마운트될 때 인터벌 정리
        return () => clearInterval(intervalId);
    }, []); // 빈 배열을 의존성 배열로 전달하여 한 번만 실행

    // useEffect(() => {
    //     console.log(info);
    // }, [info]);

    return (
        <>
            {/* name, userId, traceId select box*/}
            <Contents
                height={height}
                titlefontSize={titlefontSize}
                traceId={traceId}
            />
        </>
    );
}
