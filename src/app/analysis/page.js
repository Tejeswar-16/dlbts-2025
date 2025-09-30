"use client"

import { useEffect, useState } from "react";
import { auth, db } from "../_util/config";
import { useRouter } from "next/navigation";
import { collection, getDocs, query } from "firebase/firestore";
import Image from "next/image";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";

export default function Home(){

    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [group,setGroup] = useState("All");
    const [samithi,setSamithi] = useState("All");
    const [event,setEvent] = useState("All");
    const [maleCount,setMaleCount] = useState(0);
    const [femaleCount,setFemaleCount] = useState(0);
    const [totalCount,setTotalCount] = useState(0);
    const [loading,setLoading]  = useState(false);
    const [studentData,setStudentData] = useState([]);

    const router = useRouter();

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
                setName("Admin");
            }
        })
    })

    useEffect(() => {
        async function fetchData(){
            setLoading(true);
            const q = query(
                collection(db,"studentMarks")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            
            let filteredData = data;

            //Total Mark Calculation && Cumulative Remarks
            for (let i=0;i<filteredData.length;i++)
            {
                let judge = (filteredData[i].judge.startsWith("judge01")) ? "Judge 1" : (filteredData[i].judge.startsWith("judge02")) ? "Judge 2" : "Judge 3"
                let sum = Number(filteredData[i].totalMarks);
                let remarks = (filteredData[i].remarks != undefined) ? judge+": "+filteredData[i].remarks+"\n" : "No remarks";
                for (let j=i+1;j<filteredData.length;j++)
                {
                    if (filteredData[i].name === filteredData[j].name && filteredData[i].dob === filteredData[j].dob && filteredData[i].samithi === filteredData[j].samithi && filteredData[i].event === filteredData[j].event)
                    {
                        sum += Number(filteredData[j].totalMarks);
                        let judge = (filteredData[j].judge.startsWith("judge01")) ? "Judge 1" : (filteredData[j].judge.startsWith("judge02")) ? "Judge 2" : "Judge 3"
                        remarks += (filteredData[j].remarks != undefined) ? judge+": "+filteredData[j].remarks+"\n" : "No remarks";
                        filteredData.splice(j,1);
                        j--;
                    }
                }
                filteredData[i].totalMarks = sum;
                filteredData[i].remarks = remarks;
            }
            
            let groups = ["Group 1","Group 1","Group 1","Group 1","Group 1","Group 1","Group 1","Group 1","Group 1",
                          "Group 2","Group 2","Group 2","Group 2","Group 2","Group 2","Group 2","Group 2","Group 2","Group 2","Group 2",
                          "Group 3","Group 3","Group 3","Group 3","Group 3","Group 3","Group 3","Group 3","Group 3","Group 3","Group 3",
                          "Group 4"]
        
            let events = ["Bhajans","Slokas","Vedam","Tamizh Chants","Story Telling (English)","Story Telling (Tamil)",
                          "Drawing","Devotional Singing - Boys","Devotional Singing - Girls","Bhajans - Boys",
                          "Bhajans - Girls", "Slokas - Boys", "Slokas - Girls","Vedam - Boys","Vedam - Girls",
                          "Tamizh chants - Boys", "Tamizh chants - Girls", "Elocution (English)","Elocution (Tamil)","Drawing",
                          "Bhajans - Boys","Bhajans - Girls", "Slokas - Boys", "Slokas - Girls","Vedam - Boys","Vedam - Girls",
                          "Tamizh chants - Boys", "Tamizh chants - Girls", "Elocution (English)","Elocution (Tamil)","Drawing","Quiz","Quiz"]
                          
            let groupEvents = ["Altar Decoration - Boys","Altar Decoration - Girls","Rudram Namakam Chanting - Boys","Rudram Namakam Chanting - Girls","Devotional Singing - Boys","Devotional Singing - Girls"]

            let grpEvent = []
            for (let i=0;i<groups.length;i++){
                let ge = filteredData.filter((fd) => fd.group === groups[i] && fd.event === events[i]);
                ge = ge.sort((x,y) => y.totalMarks - x.totalMarks);
                ge = ge.slice(0,3);
                grpEvent = [...grpEvent,...ge];
            }
            for (let i=0;i<groupEvents.length;i++){
                let ge = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === groupEvents[i])
                ge = ge.sort((x,y) => y.totalMarks - x.totalMarks);
                ge = ge.slice(0,3);
                grpEvent = [...grpEvent,...ge];
            }
            
            filteredData = grpEvent;

            if (group === "Group 2 & Group 3 - Group Events")
            {
                if (event === "Altar Decoration - Boys")
                {
                    filteredData = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === "Altar Decoration - Boys")
                }
                else if (event === "Altar Decoration - Girls")
                {
                    filteredData = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === "Altar Decoration - Girls") 
                }
                else if (event === "Devotional Singing - Boys")
                {
                    filteredData = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === "Devotional Singing - Boys") 
                }
                else if (event === "Devotional Singing - Girls")
                {
                    filteredData = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === "Devotional Singing - Girls") 
                }
                else if (event === "Rudram Namakam Chanting - Boys")
                {
                    filteredData = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === "Rudram Namakam Chanting - Boys") 
                }
                else if (event === "Rudram Namakam Chanting - Girls")
                {
                    filteredData = filteredData.filter((fd) => (fd.group === "Group 2" || fd.group === "Group 3") && fd.event === "Rudram Namakam Chanting - Girls") 
                }
            }
            else
            {
                if (group !== "All")
                {
                    filteredData = filteredData.filter((fd) => fd.group === group);
                }
                if (samithi !== "All")
                {
                    filteredData = filteredData.filter((fd) => fd.samithi === samithi);
                }
                if (event !== "All")
                {
                    filteredData = filteredData.filter((fd) => fd.event === event);
                }
            }
            const maleData = filteredData.filter((fd) => fd.gender === "Male");
            const femaleData = filteredData.filter((fd) => fd.gender === "Female");
            setMaleCount(maleData.length);
            setFemaleCount(femaleData.length);
            setTotalCount(filteredData.length);
            setStudentData(filteredData);
            setLoading(false);
        }
        fetchData();
    },[group,samithi,event]);

    function handleLeaderboard(){
        router.push("/leaderboard")
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

    function handleDownload(){
        
        const resultData = studentData.map((student) => ({
            name: student.name,
            group: student.group,
            samithi: student.samithi,
            event: student.event,
            gender: student.gender,
        }));

        const worksheet = XLSX.utils.json_to_sheet(resultData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook,worksheet,"Students");
        XLSX.writeFile(workbook,"result.xlsx");
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
                            <button onClick={handleLeaderboard} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl h-8 mt-2 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Leaderboard</button>
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 h-8 mt-2 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
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
                                <option>Group 4</option>    
                                <option>Group 2 & Group 3 - Group Events</option>
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
                                </select>
                            ) : (group === "Group 3") ? (
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
                                    <option>Quiz</option>
                                </select>
                            ) : (group === "Group 4") ? (
                                <select value={event} onChange={(e) => {setEvent(e.target.value)}} className="font-sans rounded-xl border w-65 ml-4 md:ml-0 md:w-50 mt-2 mb-4 mr-4 p-2">
                                    <option value="All">All</option>
                                    <option>Quiz</option>
                                </select>
                            ) : (
                                <select value={event} onChange={(e) => {setEvent(e.target.value)}} className="font-sans rounded-xl border w-65 ml-4 md:ml-0 md:w-50 mt-2 mb-4 mr-4 p-2">
                                    <option value="All">All</option>
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
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <div className="flex flex-col justify-center w-30 md:w-50 bg-fuchsia-300 ml-5 lg:ml-4 my-2 rounded-xl p-2">
                                <h1 className="font-sans font-semibold mx-auto text-lg">Male</h1>
                                <h1 className="font-sans font-semibold mx-auto text-lg">Students</h1>
                                <h1 className="font-sans font-bold mx-auto text-3xl">{maleCount}</h1>
                            </div>
                            <div className="flex flex-col justify-center w-30 md:w-50 bg-purple-300 ml-5 lg:ml-4 my-2 rounded-xl p-2">
                                <h1 className="font-sans font-semibold mx-auto text-lg">Female</h1>
                                <h1 className="font-sans font-semibold mx-auto text-lg">Students</h1>
                                <h1 className="font-sans font-bold mx-auto text-3xl">{femaleCount}</h1>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center w-35 bg-pink-300 ml-2 mr-5 lg:mr-5 my-2 rounded-xl p-2">
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
                        <div className="flex flex-row justify-between">
                            <div></div>
                            <div className="flex justify-center font-sans font-bold mt-2 text-3xl">
                                Results
                            </div>
                            <div className="flex justify-end">
                                <Image onClick={handleDownload} className="mt-2 hover:cursor-pointer" src={"/download.jpg"} width={40} height={20} alt="download"></Image>
                            </div>
                        </div>
                        <div className="overflow-x-auto w-70 md:w-175 lg:w-245 mt-4 mb-4">
                            <table className="mx-auto text-center">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Name</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Samithi</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Group</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Event</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Total Marks</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Remarks</td>
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
                                                <td className="font-sans text-lg px-4 py-2 border border-black whitespace-pre-line">{student.remarks}</td>
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
    )
}