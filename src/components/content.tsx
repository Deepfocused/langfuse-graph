import Link from 'next/link';
import Navbar from '@/components/navbar';
import Time from '@/app/(graphs)/time/page';
import Token from '@/app/(graphs)/token/page';
import Call from '@/app/(graphs)/call/page';
import Summary from '@/app/(graphs)/summary/page';
import { motion } from 'framer-motion';
import { ContentsProps } from '@/types/chart_types';

const Contents = ({
    height = 410,
    titlefontSize = 20,
    traceId = '',
}: ContentsProps) => {
    return (
        <div className="my-4">
            <div className="rounded-l-xl rounded-tr-xl border-solid border-2 border-blue-300 shadow-2xl shadow-blue-300">
                <Navbar />
                {/* 
                            - sm: 640px 이상
                            - lg: 1024px 이상
                            - xl: 1280px 이상
                            - 2xl: 1536px 이상
                            */}
                <main
                    className="graphs-scrollbar overflow-y-scroll
                             h-[30rem]  /* 기본 - 브라우저 너비 640px 미만일 때 */
                             sm:h-[35rem]  /* 브라우저 너비 640px 이상일 때 */
                             lg:h-[40rem]  /* 브라우저 너비 1024px 이상일 때 */
                             xl:h-[45rem]  /* 브라우저 너비 1280px 이상일 때 */
                             2xl:h-[50rem]  /* 브라우저 너비 1536px 이상일 때 */"
                >
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
                                href="/time"
                                scroll={false}
                                prefetch={true}
                            >
                                <Time
                                    height={height}
                                    titlefontSize={titlefontSize}
                                    traceId={traceId}
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
                                href="/token"
                                scroll={false}
                                prefetch={true}
                            >
                                <Token
                                    height={height}
                                    titlefontSize={titlefontSize}
                                    traceId={traceId}
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
                                href="/call"
                                scroll={false}
                                prefetch={true}
                            >
                                <Call
                                    height={height}
                                    titlefontSize={titlefontSize}
                                    traceId={traceId}
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
                                href="/summary"
                                scroll={false}
                                prefetch={true}
                            >
                                <Summary
                                    height={height}
                                    titlefontSize={titlefontSize}
                                    traceId={traceId}
                                />
                            </Link>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Contents;
