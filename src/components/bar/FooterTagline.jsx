'use client'
import Link from 'next/link'
import React, { useContext } from 'react'
import { Context } from '../helper/Context'

const FooterTagline = () => {
  const { siteData } = useContext(Context)
  const name = siteData?.website_name || siteData?.name || 'Monihari'
  const year = new Date().getFullYear()

  return (
    <p className='w-full text-center italic'>
      © {year} {name}. All rights reserved.
    </p>
  )
}

export default FooterTagline
