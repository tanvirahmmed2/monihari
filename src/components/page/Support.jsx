'use client'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Send, Mail, User, MessageSquare, HelpCircle, Phone, MapPin } from 'lucide-react'
import { Context } from '../helper/Context'

const Support = () => {
  const { siteData } = useContext(Context)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/support', formData, { withCredentials: true })
      toast.success(response.data.message)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Failed to submit data')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='w-full py-12 px-4 bg-white'>
      <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10'>
        {/* Left Side: Info */}
        <div className='w-full lg:w-1/2 flex flex-col gap-6'>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col gap-3'
          >
            <div className='w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-primary'>
              <HelpCircle size={24} />
            </div>
            <h2 className='text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none'>
              Need <span className='text-primary'>Help?</span> <br />
              We're Here for You.
            </h2>
            <p className='text-slate-500 text-base font-medium max-w-sm'>
              Have questions about our products or your order? Our support team is ready to assist you 24/7.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {siteData?.email && (
              <ContactCard
                icon={<Mail size={18} />}
                title='Email Us'
                content={siteData.email}
              />
            )}
            {siteData?.phone && (
              <ContactCard
                icon={<Phone size={18} />}
                title='Call Us'
                content={siteData.phone}
              />
            )}
            {siteData?.address && (
              <ContactCard
                icon={<MapPin size={18} />}
                title='Address'
                content={[siteData.address, siteData.city, siteData.country].filter(Boolean).join(', ')}
              />
            )}
            {!siteData?.email && !siteData?.phone && (
              <ContactCard
                icon={<MessageSquare size={18} />}
                title='Live Chat'
                content='Available 9AM - 10PM'
              />
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full lg:w-1/2'
        >
          <div className='bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30'>
            <h3 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-3'>
              Send a Message
              <div className='h-1 w-10 bg-primary rounded-full'></div>
            </h3>
            
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor="name" className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>Name</label>
                  <div className='relative'>
                    <User className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
                    <input 
                      type="text" id='name' name='name' required 
                      onChange={handleChange} value={formData.name} 
                      placeholder="Your Name"
                      className='w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700 text-sm' 
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor="email" className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>Email</label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
                    <input 
                      type="email" id='email' name='email' required 
                      onChange={handleChange} value={formData.email} 
                      placeholder="Email Address"
                      className='w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700 text-sm' 
                    />
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor="subject" className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>Subject</label>
                <input 
                  type="text" id='subject' name='subject' required 
                  onChange={handleChange} value={formData.subject} 
                  placeholder="What can we help with?"
                  className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700 text-sm' 
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor="message" className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>Message</label>
                <textarea 
                  name="message" id="message" required 
                  onChange={handleChange} value={formData.message} 
                  placeholder="Describe your issue..."
                  className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700 text-sm min-h-[120px] resize-none' 
                />
              </div>

              <button 
                type='submit' 
                disabled={isSubmitting}
                className='group flex items-center justify-center gap-2.5 w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-base hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 shadow-md'
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send size={18} className={isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const ContactCard = ({ icon, title, content }) => (
  <div className='flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100'>
    <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm'>
      {icon}
    </div>
    <div className='flex flex-col'>
      <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>{title}</span>
      <span className='text-sm font-bold text-slate-700'>{content}</span>
    </div>
  </div>
)

export default Support
