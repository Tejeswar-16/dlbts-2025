"use client";

import { auth, db } from "@/app/_util/config";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { query, getDocs, collection } from "firebase/firestore";
import Image from "next/image";

export default function Judging(){
    
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
        "rudramnamakamchantinggirls" : "Rudram Namakam Chanting - Girls",
    }

    const params = useParams();

    const [group,setGroup] = useState("");
    const [event,setEvent] = useState("");
    const [judge,setJudge] = useState("");
    const [judgeEmail,setJudgeEmail] = useState("");
    const [studentData,setStudentData] = useState([]);
    const [loading,setLoading] = useState(false);
    const [clicked,setClicked] = useState(false);
    const [amName,setAmName] = useState("");
    const [stcBhaavam,setStcBhaavam] = useState(0);
    const [stcTune,setStcTune] = useState(0);
    const [stcPronunciation,setStcPronunciation] = useState(0);
    const [stcMemory,setStcMemory] = useState(0);


    function uncut(a)
    {
        if (!a)
            return "";
        let name1 = "";
        let name2 = "";
        for (let i=0;i<a.length;i++)
        {
            if (a[i]>='0' && a[i]<=9)
                name1 += a[i];
            else
                name2 += a[i];
        }
        let name3 = name2.charAt(0).toUpperCase()+name2.slice(1)+" "+name1;
        return name3;
    }

    let name = "";
    function cut(a)
    {
        name = "";
        for (let i=0;i<a.length;i++)
        {
            if (a[i] !== '@')
            {
                name += a[i];
            }
            else
            {
                break;
            }
        }
        return name;
    }

    useEffect(() => {
        setGroup(uncut(params.group));
        setEvent(eventMap[params.event]);
    },[]);

    useEffect(() => {
        setLoading(true);
        const a = auth.onAuthStateChanged((user) => {
            if (user)
            {
                setJudgeEmail(user.email);
                setJudge(cut(user.email).toUpperCase());
            }
        })
        setLoading(false);
    },[]);

    useEffect(() => {
        async function fetchData(){
            setLoading(true);
            const q = query(
                collection(db,"studentDetails")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());

            const filteredData = data.filter((fd) => (fd.group === group && (fd.event1 === event || fd.event2 === event)));
            setStudentData(filteredData);
            setLoading(false);
        }
        fetchData();
    },[group,event])

    function handleAwardMarks(name){
        setClicked(true);
        setAmName(name);
    }

    function updateMarks(){
        setClicked(false);
    }

    function handleBError(bhaavam)
    {
        if (bhaavam<0 || bhaavam>5)
            setError("Min:0 and Max:5");
    }
    
    return(
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 h-20 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, {judge}</h1>
                            <h1 className="font-sans text-sm md:text-xl px-3">{judgeEmail}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="mx-auto bg-white rounded-xl shadow-xl w-250 mt-5 pb-5">
                    <h1 className="flex justify-center font-sans font-bold text-2xl p-2">{group+" --> "+event}</h1>
                    {((event === "Bhajans") || (event === "Bhajans - Boys") || (event === "Bhajans - Girls")) && 
                    
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Shruthi</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Ragam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Taalam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Memory & Pronunciation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">50 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Slokas") || (event === "Slokas - Boys") || (event === "Slokas - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Tune</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Pronunciation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Memory</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">30 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Vedam") || (event === "Vedam - Boys") || (event === "Vedam - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Pronunciation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">15</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Intonation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">15</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Memory</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">15</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">50 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Story Telling (English)") || (event === "Story Telling (Tamil)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Presentation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Content</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Language</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">30 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Drawing")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Theme</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Colour Coordination</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Layout</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">30 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Devotional Singing - Boys") || (event === "Devotional Singing - Girls")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Shruthi</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Ragam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Taalam</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Memory & Pronunciation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Harmony</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">60 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Altar Decoration - Boys") || (event === "Altar Decoration - Girls")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-150">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Aesthetics</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Resource Management</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Teamwork</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">30 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }
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

                <div className="mx-auto bg-white rounded-xl shadow-xl mt-5 pb-5 w-250">
                        <h1 className="flex justify-center font-sans font-bold pt-4 pb-4 text-xl">Students Registered for {group}: {event}</h1>
                        <table className="mx-auto text-center w-150 pb-2">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Student Details</th>
                                    <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    studentData.map((student) => (
                                        <tr key={student.id}>
                                            <td className="font-sans px-2 py-4 font-semibold border border-black">
                                                <div className="flex flex-row justify-between items-center">
                                                    <div>
                                                        <h1 className="font-sans font-bold text-2xl">{student.name}</h1>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h1 className="font-sans text-md">Group: {student.group}</h1>
                                                        <h1 className="font-sans text-md">Gender: {student.gender}</h1>
                                                        <h1 className="font-sans text-md">DoB: {student.dob}</h1>
                                                    </div>
                                                    
                                                </div>
                                                {
                                                    (student.event2 !== "Select an event" || student.groupEvent !== "Select an event") && (
                                                        <div className="mt-1">
                                                            <h1 className="bg-red-100 p-2 rounded-xl">Participating in 2 events. Please evaluate first</h1>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black"><button onClick={() => {handleAwardMarks(student.name)}} className="bg-yellow-200 p-2 rounded-xl shadow-xl hover:cursor-pointer">Award Marks</button></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                </div>

                {
                clicked && ((event === "Slokas") || (event === "Slokas - Boys") || (event === "Slokas - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls")) &&
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-125 rounded-xl shadow-xl">
                            <h1 className="flex justify-center font-sans font-bold text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-100 mt-2 mb-2">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black"><input value={stcBhaavam} onChange={(e) => {setStcBhaavam(e.target.value);handleBError(e.target.value)}} type="number" className="w-20 text-center border rounded-xl p-2"/><br></br><h1 className="font-sans text-red-500">{error}</h1></td>
                                    </tr>
                                    <tr>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black">Tune</td>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black"><input value={stcTune} onChange={(e) => {setStcTune(e.target.value);handleTError(e.target.value)}} type="number" className="w-20 text-center border rounded-xl p-2"/><br></br><h1 className="font-sans text-red-500">{error}</h1></td>
                                    </tr>
                                    <tr>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black">Pronunciation</td>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black"><input value={stcPronunciation} onChange={(e) => {setStcPronunciation(e.target.value);handlePError(e.target.value)}} type="number" className="w-20 text-center border rounded-xl p-2"/><br></br><h1 className="font-sans text-red-500">{error}</h1></td>
                                    </tr>
                                    <tr>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black">Memory</td>
                                        <td className="font-sans px-2 py-2 font-semibold border border-black"><input value={stcMemory} onChange={(e) => {setStcMemory(e.target.value);handleMError(e.target.value)}} type="number" className="w-20 text-center border rounded-xl p-2"/><br></br><h1 className="font-sans text-red-500">{error}</h1></td>
                                    </tr>
                                    <tr>
                                        <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                        <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{Number(stcBhaavam)+Number(stcTune)+Number(stcPronunciation)+Number(stcMemory)} marks</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }  
            </div>
        </>
    );
}