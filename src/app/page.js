"use client"

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./_util/config";
import { useRouter } from "next/navigation";
import Image from "next/image"
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function Home() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);

  const router = useRouter();

  async function handleLogin(e){
    e.preventDefault();
    try
    {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth,email,password);
      const userEmail = userCredential.user.email;
      alert("Sairam! Logged in successfully");

      if (userEmail === `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`)
        router.push("/dashboard");
      if (userEmail.startsWith('registrationdesk'))
        router.push("/dashboard");
      if (userEmail.startsWith("judge"))
        router.push("/evaluation");
      if (userEmail.startsWith("officials"))
        router.push("/register");
    }
    catch(error)
    {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential")
      {
        alert("Sairam! Invalid email or password.");
      }
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <div className="relative bg-gray-100 min-h-screen md:bg-gray-100">
      <div className="px-5 py-5 font-sans text-black font-bold text-2xl">
        {"DLBTS - " + new Date().getFullYear()}
      </div>

      <div className={loading ? "blur-sm pointer-events:none" : ""}>
        <div className="font-sans bg-white rounded-3xl my-15 shadow-2xl m-auto h-80 w-70 md:m-auto md:my-30 md:h-80 md:w-120">
          <div className="pt-2 flex justify-center font-sans font-semibold text-xl md:text-2xl">
            Sign In
          </div>
          <div className="font-sans p-2 text-gray-700 md:flex md:justify-center md:text-lg text-center">
            {"DLBTS " + new Date().getFullYear() + `, ${process.env.NEXT_PUBLIC_DISTRICT_NAME}`}
          </div>
          <hr className="mt-2 text-gray-300"></hr>
          <form onSubmit={handleLogin}>
            <div className="flex justify-center">
              <input value={email} onChange={(e) => {setEmail(e.target.value)}} required className="border border-gray-400 placeholder font-sans p-2 rounded-lg my-5 md:my-5 md:w-110 md:h-10" type="email" placeholder="Email"/>
            </div>
            <div className="relative">
              <div className="flex justify-center">
                <input value={password} 
                      onChange={(e) => {setPassword(e.target.value)}} 
                      required 
                      className="border border-gray-400 placeholder font-sans p-2 rounded-lg md:w-110 md:h-10" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"/>
              </div>
              <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute hover:cursor-pointer right-8 top-1/2 -translate-y-1/2 text-xl text-gray-600 hover:text-gray-900">{showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}</button>
            </div>
            <div className="flex justify-center">
              <button type="submit" className={(password !== "") ? "font-sans text-white text-bold bg-black rounded-lg hover:cursor-pointer my-5 w-110 h-10 mx-5 md:text-xl md:my-5 md:w-110 md:h-10" : "font-sans text-white text-bold bg-gray-400 rounded-lg hover:cursor-pointer my-5 w-110 h-10 mx-5 md:text-xl md:my-5 md:w-110 md:h-10"}>Sign In</button>
            </div>
          </form>
        </div>
      </div>

      {loading && 
        <>
          <div className="fixed inset-0 flex flex-col justify-center items-center">
            <Image className="rounded-xl" src="/swami.png" alt="swami-img" width="300" height="300"></Image>
            <div className="font-mono m-2 text-3xl font-bold">
              Loading...
            </div>
          </div>
        </>
      }

    </div>
  );
}
