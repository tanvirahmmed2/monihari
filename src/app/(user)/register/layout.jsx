import { isLogin } from "@/middleware/isLogin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Register",
  description: "Register and enjoy our best services",
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
