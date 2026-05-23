'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { 
  Save, Globe, Mail, Phone, MapPin, 
  Facebook, Instagram, Linkedin, Youtube,
  Layout, Search, Palette, ShoppingBag, Loader2,
  CreditCard, Calendar, CheckCircle2, AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

const SettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    logo: '',
    favicon: '',
    meta_title: '',
    meta_description: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    primary_color: '#10b981',
    secondary_color: '#ffffff',
    is_public: true,
    is_store_enabled: true,
    subscription_status: '',
    subscription_expires_at: '',
    tenant_status: ''
  })


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      toast.success('Settings functionality has been disabled')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Store Settings</h1>
        <p className="text-slate-500 font-medium">Manage your website information and preferences.</p>
      </div>

      {/* --- Subscription Status (New Section) --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-1 border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <CreditCard size={32} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Subscription Plan</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                data.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {data.subscription_status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {data.subscription_status || 'Unknown'}
              </span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">•</span>
              <span className="text-slate-500 font-bold text-sm">
                Expires on: <span className="text-slate-900">{data.subscription_expires_at ? new Date(data.subscription_expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Website & Account Status</span>
            <div className="flex gap-2">
              <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${
                data.status === 'active' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600'
              }`}>
                Site: {data.status || 'Unknown'}
              </div>
              <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${
                data.tenant_status === 'active' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-rose-100 bg-rose-50 text-rose-600'
              }`}>
                Tenant: {data.tenant_status || 'Inactive'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-3 flex items-center justify-between border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">For billing inquiries or plan upgrades, please visit razers.com</p>
          <a href="https://www.razers.com" target="_blank" className="text-xs font-black text-sky-500 uppercase tracking-widest hover:text-sky-600 transition-colors">Contact Support</a>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- Business Profile --- */}
        <Section title="Business Profile" icon={<Globe className="text-sky-500" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputField 
                label="Website Name" name="name" 
                value={data.name} onChange={handleChange} 
                placeholder="e.g. Nizam Varieties Store"
              />
            </div>
            <InputField 
              label="Business Legal Name" name="business_name" 
              value={data.business_name} onChange={handleChange} 
            />
            <InputField 
              label="Contact Email" name="email" type="email"
              value={data.email} onChange={handleChange} 
            />
            <InputField 
              label="Phone Number" name="phone" 
              value={data.phone} onChange={handleChange} 
            />
            <div className="md:col-span-2">
              <InputField 
                label="Office Address" name="address" 
                value={data.address} onChange={handleChange} 
              />
            </div>
            <InputField 
              label="City" name="city" 
              value={data.city} onChange={handleChange} 
            />
            <InputField 
              label="Country" name="country" 
              value={data.country} onChange={handleChange} 
            />
          </div>
        </Section>

        {/* --- Branding & Assets --- */}
        <Section title="Branding" icon={<Layout className="text-indigo-500" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Logo URL" name="logo" 
              value={data.logo} onChange={handleChange} 
              placeholder="https://example.com/logo.png"
            />
            <InputField 
              label="Favicon URL" name="favicon" 
              value={data.favicon} onChange={handleChange} 
              placeholder="https://example.com/favicon.ico"
            />
            <ColorField 
              label="Primary Color" name="primary_color" 
              value={data.primary_color} onChange={handleChange} 
            />
            <ColorField 
              label="Secondary Color" name="secondary_color" 
              value={data.secondary_color} onChange={handleChange} 
            />
          </div>
        </Section>

        {/* --- SEO Settings --- */}
        <Section title="SEO & Meta" icon={<Search className="text-amber-500" />}>
          <div className="grid grid-cols-1 gap-6">
            <InputField 
              label="Meta Title" name="meta_title" 
              value={data.meta_title} onChange={handleChange} 
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Meta Description</label>
              <textarea 
                name="meta_description"
                value={data.meta_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-500 transition-all text-sm"
              />
            </div>
          </div>
        </Section>

        {/* --- Social Links --- */}
        <Section title="Social Presence" icon={<Facebook className="text-blue-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SocialField icon={<Facebook size={18} />} label="Facebook" name="facebook" value={data.facebook} onChange={handleChange} />
            <SocialField icon={<Instagram size={18} />} label="Instagram" name="instagram" value={data.instagram} onChange={handleChange} />
            <SocialField icon={<Linkedin size={18} />} label="LinkedIn" name="linkedin" value={data.linkedin} onChange={handleChange} />
            <SocialField icon={<Youtube size={18} />} label="YouTube" name="youtube" value={data.youtube} onChange={handleChange} />
          </div>
        </Section>

        {/* --- Platform Controls --- */}
        <Section title="Platform Controls" icon={<ShoppingBag className="text-rose-500" />}>
          <div className="flex flex-wrap gap-8">
            <ToggleField 
              label="Public Website" 
              description="Make the website visible to everyone."
              name="is_public" checked={data.is_public} onChange={handleChange} 
            />
            <ToggleField 
              label="Enable Store" 
              description="Enable checkout and shopping features."
              name="is_store_enabled" checked={data.is_store_enabled} onChange={handleChange} 
            />
          </div>
        </Section>

        <div className="flex justify-end pt-4 pb-12">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

const Section = ({ title, icon, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6"
  >
    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h2>
    </div>
    {children}
  </motion.div>
)

const InputField = ({ label, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{label}</label>
    <input 
      {...props}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"
    />
  </div>
)

const ColorField = ({ label, value, onChange, name }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{label}</label>
    <div className="flex items-center gap-3">
      <input 
        type="color" name={name} value={value} onChange={onChange}
        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
      />
      <input 
        type="text" value={value} readOnly
        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono uppercase"
      />
    </div>
  </div>
)

const SocialField = ({ icon, label, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input 
        {...props}
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"
      />
    </div>
  </div>
)

const ToggleField = ({ label, description, checked, onChange, name }) => (
  <label className="flex items-start gap-4 cursor-pointer group">
    <div className="relative mt-1">
      <input 
        type="checkbox" name={name} checked={checked} onChange={onChange}
        className="sr-only"
      />
      <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-sky-500' : 'bg-slate-200'}`} />
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'left-7' : 'left-1'}`} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className="text-xs text-slate-500 font-medium">{description}</span>
    </div>
  </label>
)

export default SettingsPage
