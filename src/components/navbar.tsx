'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const navItems = ['', 'time', 'token', 'call', 'summary'];
    const pathname = usePathname();
    const [active, setActive] = useState<string>(() => {
        const currentPath = pathname.split('/').at(-1);
        if (currentPath) return currentPath;
        else return '';
    });

    useEffect(() => {
        const currentPath = pathname.split('/').at(-1);
        if (currentPath) setActive(currentPath);
        else setActive('');
    }, [pathname]);

    //nextjs.org/docs/app/api-reference/components/link#replace
    return (
        <>
            <div className="mx-4 my-2 flex items-center justify-between max-[559px]:hidden">
                <div className="border-b-4 border-blue-500 text-3xl font-bold">
                    {active || 'graphs'}
                </div>
                <div className="flex gap-4 text-xl font-bold">
                    {navItems.map((item) => (
                        <div
                            key={item}
                            className="transition hover:scale-105 hover:text-blue-500"
                        >
                            <Link
                                // className="mx-3"
                                href={`/${item || ''}`}
                                scroll={false}
                                prefetch={item === ''}
                            >
                                {item || 'graphs'}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mx-4 my-2 flex items-center justify-center min-[560px]:hidden">
                <div className="flex gap-4 text-lg font-bold max-[400PX]:text-sm max-[400PX]:gap-3">
                    {navItems.map((item) => (
                        <div key={item}>
                            <Link
                                className={`${
                                    active === item
                                        ? 'border-b-4 border-blue-500'
                                        : ''
                                }`}
                                href={`/${item || ''}`}
                                scroll={false}
                                prefetch={item === ''}
                            >
                                {item || 'graphs'}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default memo(Navbar);
