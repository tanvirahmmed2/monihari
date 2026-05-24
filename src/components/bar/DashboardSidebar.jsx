'use client'
import Link from 'next/link'
import React, { useContext, useState } from 'react'
import { 
  RiHome5Line, RiProductHuntLine, RiShoppingCart2Line, 
  RiRefund2Line, RiAlertLine, RiUser3Line, RiTruckLine, 
  RiSettings3Line, RiFileChartLine, RiArchiveLine, 
  RiPriceTag3Line, RiShoppingBag3Line, RiUserAddLine, 
  RiUserCommunityLine, RiSuperscript, RiMenuLine, RiCloseLine, RiCheckboxCircleLine, RiStarLine
} from "react-icons/ri"
import { TbReport, TbMoneybag, TbReportMoney, TbReportAnalytics, TbReportSearch } from "react-icons/tb"
import { usePathname } from 'next/navigation'
import { BiPurchaseTagAlt } from "react-icons/bi"
import { BsFillHouseGearFill } from "react-icons/bs"
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { FaChevronDown } from 'react-icons/fa6'
import { Context } from '../helper/Context'
import Image from 'next/image'

const MenuItem = ({ href, icon: Icon, label, isOpen }) => {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link 
      href={href} 
      className={`group flex flex-row gap-3.5 items-center px-3.5 py-2.5 transition-all rounded-xl mx-3.5 ${
        isActive 
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/10 font-bold' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'
      }`}
    >
      <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}`} />
      {isOpen && <span className="whitespace-nowrap text-xs tracking-wide">{label}</span>}
    </Link>
  )
}

const DashboardSidebar = () => {
  const { isDashboardSidebar: isOpen, setIsDashboardSidebar, userData } = useContext(Context)
  const role = userData?.role || 'user'
  
  // Local states for submenus
  const [productsMenuOpen, setProductsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await axios.get('/api/user/login', { withCredentials: true })
      toast.success(response.data.message)
      window.location.replace('/login')
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Failed to logout')
    }
  }

  const downloadDB = async () => {
    try {
      const response = await fetch('/api/backup');
      if (!response.ok) throw new Error('Failed to generate backup');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `nizam_store_backup_${date}.sql`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Database backup downloaded successfully!");
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Could not download database backup.");
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[90] md:hidden transition-opacity"
          onClick={() => setIsDashboardSidebar(false)}
        />
      )}
      
      <aside className={`select-none fixed top-0 left-0 z-[100] text-slate-300 bg-slate-950 h-screen transition-transform duration-300 flex flex-col py-6 overflow-y-auto custom-scrollbar border-r border-slate-900 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-12 mb-6 px-2">
      </div>

      <div className="pb-4 border-b border-slate-900 mb-2">
        <MenuItem href="/dashboard" icon={RiHome5Line} label="Dashboard Home" isOpen={isOpen} />
      </div>

      <div className="flex flex-col gap-1">
        {(role === 'sales') && (
          <>
            {(isOpen) && (
              <p className="font-extrabold text-[9px] flex items-center gap-2 px-5 mb-2 uppercase tracking-wider text-slate-600 mt-2">
                <RiShoppingCart2Line size={13} /> Sales & POS
              </p>
            )}
            <MenuItem href="/dashboard/sales/pos" icon={RiShoppingCart2Line} label="POS System" isOpen={isOpen} />
            <MenuItem href="/dashboard/sales/pendingorders" icon={RiAlertLine} label="Pending Orders" isOpen={isOpen} />
            <MenuItem href="/dashboard/sales/confirmed-orders" icon={RiCheckboxCircleLine} label="Confirmed Orders" isOpen={isOpen} />
            <MenuItem href="/dashboard/sales/shipped-orders" icon={RiTruckLine} label="Shipped Orders" isOpen={isOpen} />
            <MenuItem href="/dashboard/sales/sales-list" icon={RiShoppingBag3Line} label="Order History" isOpen={isOpen} />
            <MenuItem href="/dashboard/sales/sales-transactions" icon={TbReportMoney} label="Sales Transactions" isOpen={isOpen} />
            <MenuItem href="/dashboard/sales/sale" icon={RiShoppingBag3Line} label="Sales" isOpen={isOpen} />
          </>
        )}

        {/* MANAGER ROLE SECTION */}
        {(role === 'manager') && (
          <>
            {(isOpen) && (
              <p className="font-extrabold text-[9px] flex items-center gap-2 px-5 mb-2 uppercase tracking-wider text-slate-600 mt-4">
                <RiProductHuntLine size={13} /> Inventory & Stock
              </p>
            )}
            <div className="flex flex-col gap-1">
              {(isOpen) && (
                <div onClick={() => setProductsMenuOpen(!productsMenuOpen)} className="flex items-center gap-3.5 px-5 py-2 cursor-pointer text-[12px] font-bold text-slate-400 hover:text-white transition-colors">
                  <RiProductHuntLine size={18} className="text-slate-500" /> Products 
                  <FaChevronDown size={10} className={`ml-auto transition-transform ${productsMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              )}
              <div className={`${(isOpen && productsMenuOpen) ? 'block' : 'hidden'} pl-4 flex flex-col gap-1 border-l border-slate-900 ml-8 my-1`}>
                <MenuItem href="/dashboard/manager/newproduct" icon={RiPriceTag3Line} label="New Product" isOpen={isOpen} />
                <MenuItem href="/dashboard/manager/products" icon={RiShoppingBag3Line} label="Product List" isOpen={isOpen} />
                <MenuItem href="/dashboard/manager/damage" icon={RiAlertLine} label="Damage Record" isOpen={isOpen} />
              </div>
            </div>
            <MenuItem href="/dashboard/manager/category" icon={RiArchiveLine} label="Category" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/brand" icon={RiPriceTag3Line} label="Brand" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/stock" icon={RiArchiveLine} label="Stock Report" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/supplier" icon={RiTruckLine} label="Supplier" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/customer" icon={RiUser3Line} label="Customer" isOpen={isOpen} />
            
            {(isOpen) && (
              <p className="font-extrabold text-[9px] flex items-center gap-2 px-5 mb-2 uppercase tracking-wider text-slate-600 mt-4">
                <BiPurchaseTagAlt size={13} /> Purchase Management
              </p>
            )}
            <MenuItem href="/dashboard/manager/purchase" icon={RiShoppingCart2Line} label="New Purchase" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/purchase-list" icon={RiShoppingBag3Line} label="Purchase List" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/purchase-transactions" icon={TbReportMoney} label="Purchase Transactions" isOpen={isOpen} />
            
            {(isOpen) && (
              <p className="font-extrabold text-[9px] flex items-center gap-2 px-5 mb-2 uppercase tracking-wider text-slate-600 mt-4">
                <TbMoneybag size={13} /> Finance & Reports
              </p>
            )}
            <MenuItem href="/dashboard/manager/ledger" icon={RiFileChartLine} label="Payment Ledger" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/return-orders" icon={RiRefund2Line} label="Return Orders" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/reviews" icon={RiStarLine} label="Customer Reviews" isOpen={isOpen} />
            <MenuItem href="/dashboard/manager/support" icon={RiSuperscript} label="Support Tickets" isOpen={isOpen} />
            <MenuItem href="/dashboard/help" icon={RiUserCommunityLine} label="Help Center" isOpen={isOpen} />
          </>
        )}

        {/* ADMIN ROLE SECTION */}
        {(role === 'admin') && (
          <>
            {(isOpen) && (
              <p className="font-extrabold text-[9px] flex items-center gap-2 px-5 mb-2 uppercase tracking-wider text-slate-600 mt-4">
                <TbReportAnalytics size={13} /> Admin & Analytics
              </p>
            )}
            <MenuItem href="/dashboard/admin/analytics" icon={TbReportAnalytics} label="Business Analytics" isOpen={isOpen} />
            <MenuItem href="/dashboard/admin/rolemanagement" icon={RiUserAddLine} label="Role Management" isOpen={isOpen} />
            <MenuItem href="/dashboard/admin/settings" icon={RiSettings3Line} label="Store Settings" isOpen={isOpen} />
            <MenuItem href="/dashboard/admin/activity-logs" icon={RiFileChartLine} label="Activity Logs" isOpen={isOpen} />
            
            <button 
              onClick={downloadDB} 
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold bg-slate-900 text-indigo-400 rounded-xl hover:bg-slate-800 transition-colors mx-5 my-3 border border-slate-800/80 cursor-pointer"
            >
              <BsFillHouseGearFill size={14} />
              <span>Backup Data</span>
            </button>
          </>
        )}
      </div>


      <div className="mt-auto pt-6 border-t border-slate-900 flex flex-col gap-1">
        {(isOpen) && (
          <p className="font-extrabold text-[9px] flex items-center gap-2 px-5 mb-2 uppercase tracking-wider text-slate-600">
            <BsFillHouseGearFill size={13} /> Account
          </p>
        )}
        <MenuItem href="/dashboard/account" icon={RiUser3Line} label="My Account" isOpen={isOpen} />
        <MenuItem href="/" icon={RiHome5Line} label="Visit Website" isOpen={isOpen} />
        
        {(isOpen) && (
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-[calc(100%-2.5rem)] bg-rose-500/10 text-rose-500 py-2.5 rounded-xl mx-5 mt-4 cursor-pointer font-bold hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20 shadow-sm text-xs uppercase tracking-wider"
          >
            Logout
          </button>
        )}
      </div>
      </aside>
    </>
  )
}

export default DashboardSidebar
