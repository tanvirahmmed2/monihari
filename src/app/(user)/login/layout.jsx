import { isLogin } from "@/middleware/isLogin";
import { redirect } from "next/navigation";


export const metadata = {
  title: "Login",
  description: "Log in to your accoun to access more data",
};


const RootLayout = async({children}) => {

  const auth= await isLogin()

  if(auth.success){
    redirect('/profile')
  }
  
  return (
    <>
    {children}
    </>
  )
}

export default RootLayout
