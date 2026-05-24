'use client'
import React, { useContext } from 'react'
import { Context } from '../helper/Context'
import { RiMenuLine, RiMenuFoldLine, RiNotification3Line, RiSearchLine, RiSettings3Line } from 'react-icons/ri'
import { CgMenuMotion } from 'react-icons/cg'

const DashboardTopbar = () => {
    const { isDashboardSidebar, setIsDashboardSidebar, userData } = useContext(Context)

    return (
        <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-lg border-b border-slate-100 h-16 flex items-center justify-between px-6 lg:px-8 transition-all duration-300 w-full shadow-xs">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsDashboardSidebar(!isDashboardSidebar)}
                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-50"
                    title={isDashboardSidebar ? "Close Sidebar" : "Open Sidebar"}
                >
                    {isDashboardSidebar ? <CgMenuMotion size={20} /> : <RiMenuLine size={20} />}
                </button>
                
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 relative rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors">
                    <RiNotification3Line size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                </button>
                <button className="p-2 hidden sm:block rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors">
                    <RiSettings3Line size={18} />
                </button>
                
                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-100 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex-col items-end hidden sm:flex">
                        <span className="text-xs font-bold text-slate-800 leading-tight">
                            {userData?.name || 'Administrator'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            {userData?.role || 'Admin'}
                        </span>
                    </div>
                    <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-white ring-1 ring-slate-100">
                        {(userData?.name?.[0] || 'A').toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardTopbar
