"use client";

import Image from "next/image";
import { auth, db } from "@/app/_util/config";
import { signOut } from "firebase/auth";
import { collection, getDocs, query } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function EventLeaderboard(){

    const eventMap = {
        "bhajans" : "Bhajans",
        "slokas" : "Slokas",
        "vedam" : "Vedam",
        "tamizhchants" : "Tamizh Chants",
        "storytellingenglish" : "Story Telling (English)",
        "storytellingtamil" : "Story Telling (Tamil)",
        "drawing" : "Drawing",
        "devotionalsingingboys" : "Devotional Singing - Boys",
        "devotionalsinginggirls" : "Devotional Singing - Girls",
        "bhajansboys" : "Bhajans - Boys",
        "bhajansgirls" : "Bhajans - Girls",
        "slokasboys" : "Slokas - Boys",
        "slokasgirls" : "Slokas - Girls",
        "vedamboys" : "Vedam - Boys",
        "vedamgirls" : "Vedam - Girls",
        "tamizhchantsboys" : "Tamizh chants - Boys",
        "tamizhchantsgirls" : "Tamizh chants - Girls",
        "elocutionenglish" : "Elocution (English)",
        "elocutiontamil" : "Elocution (Tamil)",
        "altardecorationboys" : "Altar Decoration - Boys",
        "altardecorationgirls" : "Altar Decoration - Girls",
        "rudramnamakamchantingboys" : "Rudram Namakam Chanting - Boys",
        "rudramnamakamchantinggirls" : "Rudram Namakam Chanting - Girls"
    }

    const groupMap = {
        "group1" : "Group 1",
        "group2" : "Group 2",
        "group3" : "Group 3"
    }

    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [group,setGroup] = useState("");
    const [event,setEvent] = useState("");
    const [studentData,setStudentData] = useState([]);
    const [loading,setLoading] = useState(false);
    const [maleCount,setMaleCount] = useState(0);
    const [femaleCount,setFemaleCount] = useState(0);
    const [totalCount,setTotalCount] = useState(0);

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

    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (!user)
            {
                router.push("/");
            }
        })
    });

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user)
            {
                setEmail(user.email);
                setName(cut(user.email).toUpperCase());
            }
        })
    });

    useEffect(() => {
        setGroup(groupMap[params.group]);
        setEvent(eventMap[params.event]);
    },[params.group,params.event]);

    function handleEventsClick(){
        router.push(`/evaluation/${params.group}/${params.event}`);
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

    useEffect(() => {
        async function getData(){
            setLoading(true);
            const q = query(
                collection(db,"studentMarks")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            let filteredData = data.filter((fd) => fd.group === group && fd.event === event);
            for (let i=0;i<filteredData.length;i++)
            {
                let sum = filteredData[i].totalMarks;
                let count = 1;
                for (let j=i+1;j<filteredData.length;j++)
                {
                    if (filteredData[i].name === filteredData[j].name && filteredData[i].dob === filteredData[j].dob && filteredData[i].samithi === filteredData[j].samithi)
                    {
                        count++;
                        sum += filteredData[j].totalMarks;
                        filteredData.splice(j,1);
                        j--;
                    }
                }
                filteredData[i].totalMarks = Math.round(sum/count);
            }
            filteredData = filteredData.sort((y,x) => x.totalMarks - y.totalMarks);
            const maleData = filteredData.filter((md) => md.gender === "Male");
            const femaleData = filteredData.filter((fd) => fd.gender === "Female");
            setMaleCount(maleData.length);
            setFemaleCount(femaleData.length);
            setTotalCount(filteredData.length);
            setStudentData(filteredData);
            setLoading(false);
        }
        getData();
    },[group,event]);

    return (
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 pb-2 md:pb-1 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, {name}</h1>
                            <h1 className="font-sans text-sm md:text-xl px-3">{email}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button onClick={handleEventsClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl h-8 mt-2 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Evaluate</button>
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 h-8 mt-3 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

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

                <div className="mx-auto rounded-xl shadow-xl bg-white w-75 md:w-100 mt-10">
                    <h1 className="font-sans flex justify-center font-bold text-xl p-2">{group+" --> "+event}</h1>
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

                <div className="mx-auto rounded-xl shadow-xl bg-white mt-10 w-75 md:w-180 lg:w-250">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="flex justify-center font-sans font-bold mt-2 text-2xl">Leaderboard</h1>
                        <h1 className="flex justify-center font-sans font-bold ml-2 text-lg md:text-2xl">{group+" --> "+event}</h1>
                        <h1 className="flex justify-center font-sans ml-2 mr-2 text-md">Sairam! Please note that the mark displayed here is the AVERAGE SCORE given to the student, as evaluated by all the judges</h1>

                        <div className="overflow-x-auto w-70 md:w-175 lg:w-245 mt-4 mb-4">
                            <table className="mx-auto text-center">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Name</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">DOB</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Gender</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Samithi</td>
                                        <td className="font-sans px-4 py-2 text-xl font-semibold border border-white">Marks</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        studentData.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-200 transition duration-300 ease-in-out">
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.name}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.dob}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.gender}</td>
                                                <td className="font-sans text-lg px-4 py-2 border border-black">{student.samithi}</td>
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