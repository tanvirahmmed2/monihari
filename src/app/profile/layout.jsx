import { isLogin } from "@/middleware/isLogin"
import { redirect } from "next/navigation"


export const metadata={
    title:'Profile',
    description: "profile page"
}


const ProfileLayout = async({children}) => {

    const auth= await isLogin()

    if(!auth.success){
      redirect('/login')
    }

  return (
    <>{children}</>
  )
}

export default  ProfileLayout
