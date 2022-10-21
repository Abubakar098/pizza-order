import Navbar from "./Navbar"
import Footer from "./Footer"
import { Children } from "react";


const Layout =  ({children}) =>{
   return (
    <>
        
        <Navbar />

        {children}
        
        <Footer />
    </>
   ) 
}

export default Layout;