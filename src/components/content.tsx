import Link from 'next/link';

import Latency from '@/app/(graphs)/latency/page';
import SummaryLatency from '@/app/(graphs)/summary-latency/page';
import Token from '@/app/(graphs)/token/page';
import SummaryToken from '@/app/(graphs)/summary-token/page';

import { motion } from 'framer-motion';
import type { ContentsProps } from '@/types/chartTypes';

const Contents = ({
    height = 410,
    titlefontSize = 20,
    showInfo = false,
}: ContentsProps) => {
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
                        className="block border-2 rounded-xl border-fuchsia-200 shadow-lg shadow-fuchsia-300/50 transition hover:scale-103 hover:shadow-fuchsia-300"
                        href="/latency"
                        scroll={false}
                        prefetch={true}
                    >
                        <Latency
                            height={height}
                            titlefontSize={titlefontSize}
                            showInfo={showInfo}
                        />
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
                        className="block border-2 rounded-xl border-violet-200 shadow-lg shadow-violet-300/50 transition hover:scale-103 hover:shadow-violet-300"
                        href="/summary-latency"
                        scroll={false}
                        prefetch={true}
                    >
                        <SummaryLatency
                            height={height}
                            titlefontSize={titlefontSize}
                            showInfo={showInfo}
                        />
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
                        className="block border-2 rounded-xl border-fuchsia-200 shadow-lg shadow-fuchsia-300/50 transition hover:scale-103 hover:shadow-fuchsia-300"
                        href="/token"
                        scroll={false}
                        prefetch={true}
                    >
                        <Token
                            height={height}
                            titlefontSize={titlefontSize}
                            showInfo={showInfo}
                        />
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
                        className="block border-2 rounded-xl border-violet-200 shadow-lg shadow-violet-300/50 transition hover:scale-103 hover:shadow-violet-300"
                        href="/summary-token"
                        scroll={false}
                        prefetch={true}
                    >
                        <SummaryToken
                            height={height}
                            titlefontSize={titlefontSize}
                            showInfo={showInfo}
                        />
                    </Link>
                </motion.div>
            </div>
        </>
    );
};

export default Contents;
