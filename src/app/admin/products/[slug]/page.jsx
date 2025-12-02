import React from 'react'

const Page = async ({params}) => {
  const tempSlug = await params
  const slug = tempSlug.slug
  return (
    <div>
      {slug}   <h1>Hello</h1>
    </div>
  )
}

export default Page
