'use client'
import Image from 'next/image'
import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Context } from '../helper/Context'

const images = [
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972932/pexels-rachel-claire-5531549_akfkue.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972936/pexels-zion-30109290_xqle28.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972934/pexels-ron-lach-8387837_ph8ssc.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972930/pexels-cup-of-couple-6956903_rmsgdx.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972929/pexels-silverkblack-36730379_ibmwfz.jpg'
]

const Intro = () => {
    const { siteData } = useContext(Context)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className='w-full max-w-7xl mx-auto px-6 md:px-8 py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center'>
            
            {/* Left Column: Text & CTA */}
            <div className='lg:col-span-5 flex flex-col items-start text-left gap-6 order-2 lg:order-1'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='space-y-4'
                >
                    <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-xs'>
                        <RefreshCw size={11} className='animate-spin' />
                        Collection 2026
                    </div>
                    
                    <h1 className='text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[0.95]'>
                        STYLE <br />
                        <span className='bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent underline decoration-indigo-500/20 underline-offset-8'>EVOLVED.</span>
                    </h1>
                    
                    <p className='text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-md'>
                        Experience the flawless fusion of premium aesthetics and daily utility. {siteData?.name || 'Monihari'} defines the next generation of retail.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'
                >
                    <Link href='/products' className='group px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 transition-all active:scale-[0.98]'>
                        Explore Shop
                        <ArrowRight size={15} className='group-hover:translate-x-1 transition-transform' />
                    </Link>
                    <Link href='/offers' className='px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98] text-center'>
                        View Deals
                    </Link>
                </motion.div>
            </div>

            {/* Right Column: Image Slider Card */}
            <div className='lg:col-span-7 order-1 lg:order-2 relative w-full aspect-video lg:aspect-16/10 rounded-3xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200/50 group'>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.6 }}
                        className='absolute inset-0'
                    >
                        <Image
                            src={images[currentIndex]}
                            fill
                            priority
                            className='object-cover'
                            alt='Showcase Image'
                            sizes='(max-w-1024px) 100vw, 50vw'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent' />
                    </motion.div>
                </AnimatePresence>

                {/* Dot Indicators */}
                <div className='absolute bottom-6 left-6 flex gap-1.5 z-10'>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}

export default Intro