"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "../_util/config";
import { useRouter } from "next/navigation";
import { collection, getDocs, query } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function Leadboard(){
    
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [group,setGroup] = useState("All");
    const [samithi,setSamithi] = useState("All");
    const [event,setEvent] = useState("All");
    const [studentData,setStudentData] = useState([]);
    const [loading,setLoading] = useState(false);
    const [maleCount,setMaleCount] = useState(0);
    const [femaleCount,setFemaleCount] = useState(0);
    const [totalCount,setTotalCount] = useState(0);
    const [heading,setHeading] = useState("Search by Group, Samithi or Event");

    let judgeName = "";
    function cut(a)
    {
        judgeName = "";
        for (let i=0;i<a.length;i++)
        {
            if (a[i] !== '@')
            {
                judgeName += a[i];
            }
            else
            {
                break;
            }
        }
        return judgeName;
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (!user)
                router.push("/");
        })
    })

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user)
            {
                setEmail(user.email);
                if (user.email === "admin@dlbts.ks")
                    setName("Admin");
                else    
                    setName(cut(user.email).toUpperCase());
            }
        })
    },[cut]);

    const router = useRouter();
    function handleEventsClick(){
        if (email === "admin@dlbts.ks")
            router.push("/dashboard");
        else
            alert("Sairam! You do not have access to visit Dashboard page");
    }

    useEffect(() => {
        async function getWinners(){
            setLoading(true);
            const q = query(
                collection(db,"studentMarks")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());

            let filteredData = data;
            for (let i=0;i<filteredData.length;i++)
            {
                let sum = filteredData[i].totalMarks;
                let count = 1;
                for (let j=i+1;j<filteredData.length;j++)
                {
                    if (filteredData[i].name === filteredData[j].name && filteredData[i].dob === filteredData[j].dob && filteredData[i].samithi === filteredData[j].samithi && filteredData[i].event === filteredData[j].event)
                    {
                        count++;
                        sum += filteredData[j].totalMarks;
                        filteredData.splice(j,1);
                        j--;
                    }
                }
                filteredData[i].totalMarks = Math.round(sum/count);
            }
            console.log(group);
            if (group !== "All")
            {
                filteredData = filteredData.filter((fd) => fd.group === group)
            }
            if (samithi !== "All")
            {
                filteredData = filteredData.filter((fd) => fd.samithi === samithi)
            }
            if (event !== "All")
            {
                filteredData = filteredData.filter((fd) => fd.event === event)
            }

            filteredData = filteredData.sort((y,x) => x.totalMarks - y.totalMarks)
            const maleData = filteredData.filter((md) => md.gender === "Male");
            const femaleData = filteredData.filter((fd) => fd.gender === "Female");
            setMaleCount(maleData.length);
            setFemaleCount(femaleData.length);
            setTotalCount(filteredData.length);
            setStudentData(filteredData);

            let headingParts = [];

            if (group !== "All") headingParts.push(`Group: ${group}`);
            if (samithi !== "All") headingParts.push(`Samithi: ${samithi}`);
            if (event !== "All") headingParts.push(`Event: ${event}`);
            if (headingParts.length === 0)
                setHeading("Search by Group, Samithi or Event");
            else
                setHeading(headingParts.join(", "));
            setLoading(false);
        }   
        getWinners();
    },[group,samithi,event]);

    function handlePrizeWinners(){
        const top3 = studentData.slice(0,3);
        const cutoff = top3[2].totalMarks;
        const top = studentData.filter((fd) => fd.totalMarks >= cutoff)
        const maleTop = top.filter((fd) => fd.gender === "Male");
        const femaleTop = top.filter((fd) => fd.gender === "Female");
        setMaleCount(maleTop.length);
        setFemaleCount(femaleTop.length);
        setTotalCount(top.length);
        setStudentData(top);       
        setHeading("Top Scorers -> "+heading);
    }

    function handleLogout(){
        signOut(auth)
            .then(() => {
                alert("Sairam! Signed out successfully");
                router.push("/");
            })
            .catch((error) => {
                console.log(error.message);
            })
    }
    
    return (
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 pb-1 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, {name}</h1>
                            <h1 className="font-sans text-sm md:text-xl px-3">{email}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button onClick={handleEventsClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl h-8 mt-2 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Dashboard</button>
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 h-8 mt-3 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="mx-auto rounded-xl shadow-xl bg-white mt-5 w-75 md:w-180 lg:w-250">
                    <h1 className="flex justify-center font-sans font-bold text-xl md:text-2xl p-2">Leaderboard</h1>
                    <div className="flex flex-col justify-between md:flex md:flex-row md:justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold md:text-xl pl-4">Group</h1>
                            <select value={group} onChange={(e) => {setGroup(e.target.value)}} className="font-sans rounded-xl border w-65 md:w-40 ml-4 mt-2 mb-4 p-2">
                                <option value="All">All</option>
                                <option>Group 1</option>
                                <option>Group 2</option>
                                <option>Group 3</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold md:text-xl ml-4 md:ml-0">Samithi</h1>
                            <select value={samithi} onChange={(e) => {setSamithi(e.target.value)}} className="font-sans rounded-xl border w-65 ml-4 md:ml-0 md:w-45 mt-2 mb-4 p-2">
                                <option value="All">All</option>
                                <option>Chengalpet</option>
                                <option>Collectorate</option>
                                <option>Guduvancheri</option>
                                <option>Indra Nagar</option>
                                <option>Irumbuliyur</option>
                                <option>Little Kancheepuram</option>
                                <option>Madambakkam</option>
                                <option>Main Kancheepuram</option>
                                <option>Mannivakkam</option>
                                <option>Maraimalai Nagar</option>
                                <option>Parvathi Nagar</option>
                                <option>Perungalathur</option>
                                <option>Poondi Bazar</option>
                                <option>Sothupakkam</option>
                                <option>Sriperumpudur</option>
                                <option>Tambaram</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold md:text-xl ml-4 md:ml-0">Event</h1>
                            {
                            (group === "Group 1") ? ( 
                                <select value={event} onChange={(e) => {setEvent(e.target.value)}} className="font-sans rounded-xl border w-65 ml-4 md:ml-0 md:w-50 mt-2 mb-4 mr-4 p-2">
                                    <option value="All">All</option>
                                    <option>Bhajans</option>
                                    <option>Slokas</option>
                                    <option>Vedam</option>
                                    <option>Tamizh Chants</option>
                                    <option>Story Telling (English)</option>
                                    <option>Story Telling (Tamil)</option>
                                    <option>Drawing</option>
                                    <option>Devotional Singing - Boys</option>
                                    <option>Devotional Singing - Girls</option>
                                </select>
                            ) : (group === "Group 2") ? (
                                <select value={event} onChange={(e) => {setEvent(e.target.value)}} className="font-sans rounded-xl border w-65 ml-4 md:ml-0 md:w-50 mt-2 mb-4 mr-4 p-2">
                                    <option value="All">All</option>
                                    <option>Bhajans - Boys</option>
                                    <option>Bhajans - Girls</option>
                                    <option>Slokas - Boys</option>
                                    <option>Slokas - Girls</option>
                                    <option>Vedam - Boys</option>
                                    <option>Vedam - Girls</option>
                                    <option>Tamizh chants - Boys</option>
                                    <option>Tamizh chants - Girls</option>
                                    <option>Elocution (English)</option>
                                    <option>Elocution (Tamil)</option>
                                    <option>Drawing</option>
                                    <option>Altar Decoration - Boys</option>
                                    <option>Altar Decoration - Girls</option>
                                    <option>Devotional Singing - Boys</option>
                                    <option>Devotional Singing - Girls</option>
                                    <option>Rudram Namakam Chanting - Boys</option>
                                    <option>Rudram Namakam Chanting - Girls</option>
                                </select>
                            ) : (
                                <select value={event} onChange={(e) => {setEvent(e.target.value)}} className="font-sans rounded-xl border w-65 ml-4 md:ml-0 md:w-50 mt-2 mb-4 mr-4 p-2">
                                    <option value="All">All</option>
                                    <option>Bhajans - Boys</option>
                                    <option>Bhajans - Girls</option>
                                    <option>Slokas - Boys</option>
                                    <option>Slokas - Girls</option>
                                    <option>Vedam - Boys</option>
                                    <option>Vedam - Girls</option>
                                    <option>Tamizh chants - Boys</option>
                                    <option>Tamizh chants - Girls</option>
                                    <option>Elocution (English)</option>
                                    <option>Elocution (Tamil)</option>
                                    <option>Drawing</option>
                                    <option>Altar Decoration - Boys</option>
                                    <option>Altar Decoration - Girls</option>
                                    <option>Devotional Singing - Boys</option>
                                    <option>Devotional Singing - Girls</option>
                                    <option>Rudram Namakam Chanting - Boys</option>
                                    <option>Rudram Namakam Chanting - Girls</option>
                                </select>
                            )}
                        </div>                   
                    </div>
                </div>

                <div className="mx-auto rounded-xl shadow-xl bg-white w-75 md:w-100 mt-10">
                    <h1 className="font-sans flex justify-center font-bold text-md p-2">{heading}</h1>
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <div className="flex flex-col justify-center w-30 md:w-50 bg-fuchsia-300 ml-5 lg:ml-4 mb-2 rounded-xl p-2">
                                <h1 className="font-sans font-semibold mx-auto text-lg">Male</h1>
                                <h1 className="font-sans font-semibold mx-auto text-lg">Students</h1>
                                <h1 className="font-sans font-bold mx-auto text-3xl">{maleCount}</h1>
                            </div>
                            <div className="flex flex-col justify-center w-30 md:w-50 bg-purple-300 ml-5 lg:ml-4 mb-2 rounded-xl p-2">
                                <h1 className="font-sans font-semibold mx-auto text-lg">Female</h1>
                                <h1 className="font-sans font-semibold mx-auto text-lg">Students</h1>
                                <h1 className="font-sans font-bold mx-auto text-3xl">{femaleCount}</h1>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center w-35 bg-pink-300 ml-2 mr-5 lg:mr-8 mb-2 rounded-xl p-2">
                            <h1 className="font-sans mx-auto font-semibold text-lg">Total</h1>
                            <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                            <h1 className="font-sans mx-auto font-bold mt-3 text-3xl">{totalCount}</h1>
                        </div>
                    </div>
                </div>

                {loading && 
                    <>
                        <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                            <Image className="rounded-xl" src="/swami.png" alt="swami-img" width="300" height="300"></Image>
                            <div className="font-mono m-2 text-3xl font-bold">
                                Loading...
                            </div>
                        </div>
                    </>
                }

                <div className="mx-auto bg-white rounded-xl shadow-xl w-75 md:w-180 lg:w-250 mt-5">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="font-sans font-bold rounded-xl shadow-lg bg-gray-200 text-black text-2xl p-2 mt-4">Leaderboard</h1>
                        {(studentData.length > 3) && (
                            <button onClick={handlePrizeWinners} className="font-sans font-bold rounded-xl shadow-lg bg-gray-200 text-black text-2xl p-2 mt-4 hover:cursor-pointer hover:text-white hover:bg-yellow-800 transition duration-300 ease-in-out">Get top 3 Scorers</button>
                        )}
                        <div className="overflow-x-auto w-70 md:w-175 lg:w-245 mt-4 mb-4">
                            <table className="mx-auto text-center">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Name</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Samithi</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Group</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Event</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Marks</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        studentData.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-200 transition duration-300 ease-in-out">
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.name}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.samithi}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.group}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.event}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.totalMarks}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}