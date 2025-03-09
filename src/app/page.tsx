'use client';

import Link from 'next/link';
import Time from '@/app/(graphs)/time/page';
import Token from '@/app/(graphs)/token/page';
import Call from '@/app/(graphs)/call/page';
import Summary from '@/app/(graphs)/summary/page';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <>
            <div className="mt-2 mx-4 grid gap-6 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0.0, scale: 0.7 }}
                    animate={{
                        scale: [1, 1, 1],
                        opacity: [0.0, 0.0, 1],
                        y: [3, 0],
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <Link
                        className="block p-2 border-2 rounded-xl border-fuchsia-200 shadow-lg shadow-fuchsia-300/50 transition hover:scale-103 hover:shadow-fuchsia-300"
                        href="/time"
                        scroll={false}
                        prefetch={true}
                    >
                        <Time />
                    </Link>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0.0, scale: 0.7 }}
                    animate={{
                        scale: [1, 1, 1],
                        opacity: [0.0, 0.0, 1],
                        y: [6, 0],
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <Link
                        className="block p-2 border-2 rounded-xl border-violet-200 shadow-lg shadow-violet-300/50 transition hover:scale-103 hover:shadow-violet-300"
                        href="/time"
                        scroll={false}
                        prefetch={true}
                    >
                        <Token />
                    </Link>
                </motion.div>
            </div>
            <div className="mt-6 mx-4 grid gap-6 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0.0, scale: 1 }}
                    animate={{
                        scale: [1, 1, 1],
                        opacity: [0.0, 0.0, 1],
                        y: [9, 0],
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <Link
                        className="block p-2 border-2 rounded-xl border-fuchsia-200 shadow-lg shadow-fuchsia-300/50 transition hover:scale-103 hover:shadow-fuchsia-300"
                        href="/time"
                        scroll={false}
                        prefetch={true}
                    >
                        <Call />
                    </Link>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0.0, scale: 0.7 }}
                    animate={{
                        scale: [1, 1, 1],
                        opacity: [0.0, 0.0, 1],
                        y: [12, 0],
                    }}
                    transition={{ duration: 0.8 }}
                >
                    <Link
                        className="block p-2 border-2 rounded-xl border-violet-200 shadow-lg shadow-violet-300/50 transition hover:scale-103 hover:shadow-violet-300"
                        href="/time"
                        scroll={false}
                        prefetch={true}
                    >
                        <Summary />
                    </Link>
                </motion.div>
            </div>
        </>
    );
}
