"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export const IntroSplash = () => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Lock scrolling while intro is visible
        document.body.style.overflow = "hidden";

        // Auto-hide after ~3 seconds
        const timer = setTimeout(() => {
            setShow(false);
            // Re-enable scrolling after exit animation
            setTimeout(() => {
                document.body.style.overflow = "unset";
            }, 800);
        }, 3200);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, []);

    // Also clear interval if unmounted directly just in case
    useEffect(() => {
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }} // Slight scale on exit adds polish
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
                >
                    {/* Background glow effects matching the website */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                    {/* Content Wrapper */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Logo Icon */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                            className="mb-8 relative"
                        >
                            <div className="absolute inset-0 bg-blue-500/40 blur-2xl rounded-full" />
                            <Shield className="w-24 h-24 text-blue-500 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6 text-center drop-shadow-lg"
                        >
                            Priva<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Seal</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <p className="text-xl md:text-2xl text-gray-400 font-medium text-center">
                                Verify Anything. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">Reveal Nothing.</span>
                            </p>
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "8rem", opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                                className="h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
