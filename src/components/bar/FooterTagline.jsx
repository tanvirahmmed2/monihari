'use client'
import Link from 'next/link'
import React from 'react'

const FooterTagline = () => {
  return (
     <p className='w-full text-center italic'>Copyright reserved by <Link className='font-semibold not-italic' href={'https://razers.com'}>Razers | 2023</Link></p>
  )
}

export default FooterTagline
