"use client";

import { auth } from "@/app/_util/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Events(){

    const [adminEmail,setAdminEmail] = useState("");


    useEffect(() => {
        const a = auth.onAuthStateChanged((user) => {
            if (user)
            {
                setAdminEmail(user.email);
            }
        })
    },[]);

    const router = useRouter();
    function handleDashboardClick(){
        router.push("/dashboard");
    }

    return (
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 h-20 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, Admin</h1>
                            <h1 className="font-sans text-sm md:text-xl px-3">{adminEmail}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button onClick={handleDashboardClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl my-3 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Dashboard</button>
                            <button className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    );
}