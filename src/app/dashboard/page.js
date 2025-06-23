"use client"

import { useEffect, useState } from "react";
import { auth } from "../_util/config";
import LogisticsList from "../LogisticsList";
import Image from "next/image";
import { db } from "../_util/config";
import { query, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Dashboard(){

    const [adminEmail,setAdminEmail] = useState("");
    const [searchName,setSearchName] = useState("");
    const [searchGroup,setSearchGroup] = useState("All");
    const [searchEvent,setSearchEvent] = useState("All");
    const [searchSamithi,setSearchSamithi] = useState("All");
    const [count,setCount] = useState(0);
    const [countMale,setCountMale] = useState(0);
    const [countFemale,setCountFemale] = useState(0);
    const [filterHeading,setFilterHeading] = useState("Search by Name, Group, Samithi or Event");
    const [loading,setLoading] = useState(false);
    const [studentData,setStudentData] = useState([]);

    const router = useRouter();
    function handleEventsClick(){
        router.push("/leaderboard");
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (!user)
            {
                router.push("/");
            }
        })
    },[router])
    
    useEffect(() => {
        const a = auth.onAuthStateChanged((user) => {
            if (user)
            {
                if (user.email != "admin@dlbts.ks")
                {
                    alert("Sairam! You do not have access to visit Dashboard Page. Please login with correct credentials");
                    router.push("/");
                }
            }
        });
        return () => {
            a();
        }
    },[router])

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user)
            {
                setAdminEmail(user.email);
            }
        })
    },[])

    useEffect(() => {
        async function getData()
        {
            setLoading(true);
            setCountMale(0);
            setCountFemale(0);
            setCount(0);
            setFilterHeading("Search by Name, Group, Samithi or Event")

            const q = query(
                collection(db,"studentDetails")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            
            let filteredContent = data;
            if (searchName !== "")
            {
                filteredContent = filteredContent.filter((fc) => (fc.name).startsWith(searchName));
            }
            if (searchGroup !== "All")
            {   
                filteredContent = filteredContent.filter((fc) => fc.group === searchGroup);
            }
            if (searchEvent !== "All")
            {
                filteredContent = filteredContent.filter((fc) => fc.event1 === searchEvent || fc.event2 === searchEvent || fc.groupEvent === searchEvent);
            }
            if (searchSamithi !== "All")
            {
                filteredContent = filteredContent.filter((fc) => fc.samithi === searchSamithi);
            }
            setStudentData(filteredContent);

            if (searchName !== "" || searchGroup !== "All" || searchEvent !== "All" || searchSamithi !== "All")
            {
                
                const maleContent = filteredContent.filter((fc) => fc.gender === "Male");
                const femaleContent = filteredContent.filter((fc) => fc.gender === "Female");
                setCountMale(maleContent.length);
                setCountFemale(femaleContent.length);
                setCount(maleContent.length + femaleContent.length);
            }

            let headingParts = [];

            if (searchName !== "") headingParts.push(`Name: ${searchName}`);
            if (searchGroup !== "All") headingParts.push(`Group: ${searchGroup}`);
            if (searchSamithi !== "All") headingParts.push(`Samithi: ${searchSamithi}`);
            if (searchEvent !== "All") headingParts.push(`Event: ${searchEvent}`);
            if (headingParts.length === 0)
                setFilterHeading("Search by Name, Group, Samithi or Event");
            else
                setFilterHeading("Search by " + headingParts.join(", "));
            setLoading(false);
        }
        getData();
    },[searchName,searchGroup,searchEvent,searchSamithi]);

    function handleLogout(){
        signOut(auth)
            .then(() => {
                alert("Sairam! Signed out sucessfully");
                router.push("/");
            })
            .catch((error) => {
                console.log(error.message);
            })
    }

    function handleEClick(){
        router.push("/evaluation")
    }

    return (
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, Admin</h1>
                            <h1 className="font-sans text-sm md:text-xl px-3">{adminEmail}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button onClick={handleEClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-purple-200 px-2 md:rounded-xl mt-1 mb-2 mx-2 md:h-15 md:mx-2 md:my-2 hover:text-black hover:bg-purple-500 hover:cursor-pointer transition duration-300 ease-in-out">Events</button>
                            <button onClick={handleEventsClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl mb-2 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Leaderboard</button>
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 mb-1 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <LogisticsList/>

                <div className="hidden md:flex md:flex-row md:justify-between lg:hidden">
                    <div className="ml-10 mt-10 bg-white shadow-xl rounded-2xl w-75 h-90 lg:w-250 lg:h-45">
                        <input value={searchName} onChange={(e) => {setSearchName(e.target.value.toUpperCase())}} className="mx-auto font-sans text-xl rounded-xl ml-3 w-69 lg:ml-10 lg:w-345 lg:h-10 border p-2 my-4" placeholder="Search student by name"/>
                        <div className="flex flex-col justify-between lg:flex lg:flex-row lg:justify-between">
                            <div className="flex flex-col">
                                <h1 className="font-sans font-bold text-xl mt-2 ml-3 lg:mx-10">Group</h1>
                                <select value={searchGroup} onChange={(e) => {setSearchGroup(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-60 h-10 p-2">
                                    <option value="All">All</option>
                                    <option>Group 1</option>
                                    <option>Group 2</option>
                                    <option>Group 3</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="font-sans font-bold text-xl mt-2 ml-3 lg:mx-10">Samithi</h1>
                                <select value={searchSamithi} onChange={(e) => {setSearchSamithi(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-60 h-10 p-2">
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
                                <h1 className="font-sans font-bold text-xl mt-2 ml-3 lg:mx-10">Event</h1>
                                {(searchGroup === "Group 1") ? 
                                    <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-93 h-10 p-2">
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
                                : (searchGroup === "Group 2") ?
                                    <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-93 h-10 p-2">
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
                                :
                                    <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-93 h-10 p-2">
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
                                }
                            </div>
                        </div>
                    </div> 

                    <div className="flex flex-row">
                        <div className="mr-10 rounded-xl shadow-xl bg-white w-75 lg:w-130 lg:h-50 mt-10">
                            <h1 className="font-sans flex justify-center font-bold text-xl p-2">{filterHeading}</h1>
                            <div className="flex flex-rows justify-between">
                                <div className="flex flex-col justify-center w-30 lg:w-35 bg-yellow-200 ml-5 lg:ml-8 mb-2 rounded-xl p-2">
                                    <h1 className="font-sans font-semibold mx-auto text-lg">Male</h1>
                                    <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                                    <h1 className="font-sans font-bold mx-auto mt-3 text-3xl">{countMale}</h1>
                                </div>
                                <div className="flex flex-col justify-center w-30 lg:w-35 bg-yellow-200 mr-5 ml-1 mb-2 rounded-xl p-2">
                                    <h1 className="font-sans font-semibold mx-auto text-lg">Female</h1>
                                    <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                                    <h1 className="font-sans font-bold mx-auto mt-3 text-3xl">{countFemale}</h1>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col justify-center w-65  ml-5 mr-5 bg-green-200 mt-2 rounded-xl p-2">
                                    <h1 className="font-sans mx-auto font-semibold text-lg">Total</h1>
                                    <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                                    <h1 className="font-sans mx-auto font-bold mt-3 text-3xl">{count}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-10 bg-white shadow-xl rounded-2xl w-75 h-90 block md:hidden lg:block lg:w-250 lg:h-45">
                    <input value={searchName} onChange={(e) => {setSearchName(e.target.value.toUpperCase())}} className="mx-auto font-sans text-xl rounded-xl ml-3 w-69 lg:ml-10 lg:w-230 lg:h-10 border p-2 my-4" placeholder="Search student by name"/>
                    <div className="flex flex-col justify-between lg:flex lg:flex-row lg:justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl mt-2 ml-3 lg:mx-10">Group</h1>
                            <select value={searchGroup} onChange={(e) => {setSearchGroup(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-60 h-10 p-2">
                                <option value="All">All</option>
                                <option>Group 1</option>
                                <option>Group 2</option>
                                <option>Group 3</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl mt-2 ml-3 lg:mx-10">Samithi</h1>
                            <select value={searchSamithi} onChange={(e) => {setSearchSamithi(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-60 h-10 p-2">
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
                            <h1 className="font-sans font-bold text-xl mt-2 ml-3 lg:mx-10">Event</h1>
                            {(searchGroup === "Group 1") ? 
                                <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-70 h-10 p-2">
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
                            : (searchGroup === "Group 2") ?
                                <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-70 h-10 p-2">
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
                            :
                                <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-70 h-10 p-2">
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
                            }
                        </div>
                    </div>
                </div> 

                <div className="flex flex-row block md:hidden lg:block">
                    <div className="mx-auto rounded-xl shadow-xl bg-white w-75 lg:w-250 lg:h-45 mt-10">
                        <h1 className="font-sans flex justify-center font-bold text-xl lg:text-2xl p-2">{filterHeading}</h1>
                        <div className="flex flex-rows justify-between">
                            <div className="flex flex-col justify-center w-30 lg:w-50 bg-yellow-200 ml-1 lg:ml-8 mb-2 rounded-xl p-2">
                                <h1 className="font-sans font-semibold mx-auto text-lg">Male</h1>
                                <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                                <h1 className="font-sans font-bold mx-auto mt-3 text-3xl">{countMale}</h1>
                            </div>
                            <div className="flex flex-col justify-center w-30 lg:w-50 bg-green-200 ml-1 lg:mr-8 mb-2 rounded-xl p-2">
                                <h1 className="font-sans mx-auto font-semibold text-lg">Total</h1>
                                <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                                <h1 className="font-sans mx-auto font-bold mt-3 text-3xl">{count}</h1>
                            </div>
                            <div className="flex flex-col justify-center w-30 lg:w-50 bg-yellow-200 ml-1 mr-1 mb-2 lg:mr-8 rounded-xl p-2">
                                <h1 className="font-sans font-semibold mx-auto text-lg">Female</h1>
                                <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                                <h1 className="font-sans font-bold mx-auto mt-3 text-3xl">{countFemale}</h1>
                            </div>
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

                <div className="mx-auto bg-white rounded-xl shadow-xl w-75 mt-10 md:w-180 lg:w-250 p-5 ">
                    <div className="flex justify-center pb-4 font-sans font-bold text-2xl">
                        Details of Registered Students - DLBTS 2025
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-300 mx-auto overflow-x-auto lg:w-240 border border-black">
                        <table className="text-center w-357">
                            <thead className="bg-blue-950 text-white">
                                <tr>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Name</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Gender</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">DoB</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Group</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Samithi</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Event 1</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Event 2</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Group Event</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                (!loading &&   
                                    studentData.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-200 transition duration-300 ease-in-out">
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.name}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.gender}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.dob}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.group}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.samithi}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.event1}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.event2}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.groupEvent}</td>
                                        </tr>
                                    ))
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}