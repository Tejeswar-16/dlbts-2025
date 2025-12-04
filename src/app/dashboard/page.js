"use client"

import { useEffect, useState } from "react";
import { auth } from "../_util/config";
import LogisticsList from "../LogisticsList";
import Image from "next/image";
import { db } from "../_util/config";
import { query, collection, getDocs, doc, updateDoc, where, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";

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
    const [fileName,setFileName] = useState("");
    const [backup,setBackup] = useState(false);

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
    },[]);

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
            filteredContent = filteredContent.filter((fc) => (fc.name).includes(searchName));
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
        filteredContent = filteredContent.sort((x,y) => x.name.localeCompare(y.name));
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
        let excelHeading = [];

        if (searchName !== "") {headingParts.push(`Name: ${searchName}`); excelHeading.push(`Name: ${searchName}`); }
        if (searchGroup !== "All") {headingParts.push(`Group: ${searchGroup}`); excelHeading.push(`Group: ${searchGroup}`);}
        if (searchSamithi !== "All") {headingParts.push(`Samithi: ${searchSamithi}`); excelHeading.push(`Samithi: ${searchSamithi}`);}
        if (searchEvent !== "All") {headingParts.push(`Event: ${searchEvent}`); excelHeading.push(`Event: ${searchEvent}`);}
        if (headingParts.length === 0){
            setFilterHeading("Search by Name, Group, Samithi or Event");
            setFileName("all-students");
        }
        else{
            setFilterHeading("Search by " + headingParts.join(", "));
            setFileName(excelHeading.join("-"));
        }
        setLoading(false);
    }

    useEffect(() => {
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
        router.push("/register")
    }

    function handleEventClick(){
        router.push("/evaluation")
    }

    //Modified for displaying only Group 1 students
    useEffect(() => {
        onSnapshot(collection(db,"studentDetails"), (snapshot) => {
            let updatedData = snapshot.docs.map((doc) => ({
                id : doc.id,
                ...doc.data()
            })); 
            updatedData = updatedData.sort((x,y) => x.name.localeCompare(y.name));
            setStudentData(updatedData);
        });
    },[]);

    const handleAttendance = async (nameValue) => {
         const q = query(
            collection(db,"studentDetails"),
            where("name","==",nameValue)
         );
         const querySnapshot = await getDocs(q);
         querySnapshot.forEach(async (document) => {
            const docRef = doc(db,"studentDetails",document.id);
            const currentAttendance = document.data().attendance;
            await updateDoc(docRef,{
                attendance : (currentAttendance === "P") ? "A" : "P"
            });
         });

         getData();
    }

    function handleDownload(){
        const worksheet = XLSX.utils.json_to_sheet(studentData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook,worksheet,"Students");
        XLSX.writeFile(workbook,fileName.toLowerCase()+".xlsx");
    }

    function handleBackup(){
        setBackup(true);
    }

    async function handleBackupClick(){
        setLoading(true);
        //Fetching data from studentDetails
        const q = query(
            collection(db,"studentDetails") 
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => doc.data());

        //Storing data into backup studentDetails
        for(let i=0;i<data.length;i++)
            await addDoc(collection(db,"backup","2025","studentDetails"),data[i]);

        //Deleting the actual collection
        for (let i=0;i<querySnapshot.docs.length;i++)
            await deleteDoc(doc(db,"studentDetails",querySnapshot.docs[i].id))
        

        //Fetching data from studentMarks
        const q1 = query(
            collection(db,"studentMarks") 
        );
        const querySnapshot1 = await getDocs(q1);
        const data1 = querySnapshot1.docs.map((doc) => doc.data());

        //Storing data into backup studentDetails
        for(let i=0;i<data1.length;i++)
            await addDoc(collection(db,"backup","2025","studentMarks"),data1[i]);

        //Deleting the actual collection
        for (let i=0;i<querySnapshot1.docs.length;i++)
            await deleteDoc(doc(db,"studentMarks",querySnapshot1.docs[i].id))

        alert("Sairam! Backup was successful");
        setBackup(false);
        setLoading(false);
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
                            <div className="flex flex-col md:flex-row">
                                <div className="flex flex-col">
                                    <button onClick={handleBackup} className="font-sans font-semibold text-sm rounded-lg border border-blue-500 bg-blue-200 px-2 md:rounded-xl mt-1 mb-1 mx-2 md:mx-2 hover:text-black hover:bg-blue-500 hover:text-white hover:cursor-pointer transition duration-300 ease-in-out">Backup</button>
                                    <button onClick={handleEventClick} className="font-sans font-semibold text-sm rounded-lg border border-fuchsia-500 bg-fuchsia-200 px-2 md:rounded-xl mb-1 mx-2 md:mx-2 hover:text-black hover:bg-fuchsia-500 hover:cursor-pointer transition duration-300 ease-in-out">Events</button>        
                                    <button onClick={handleEventsClick} className="font-sans font-semibold text-sm rounded-lg border border-yellow-500 bg-yellow-100 px-2 md:rounded-xl mb-2 mx-1 md:mx-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Leaderboard</button>
                                </div>
                                <div className="flex flex-col">
                                    <button onClick={handleEClick} className="font-sans font-semibold text-sm rounded-lg border border-purple-500 bg-purple-200 px-2 md:rounded-xl mx-2 w-40 md:w-25 md:mx-2 md:mt-1 hover:text-black hover:bg-purple-500 hover:cursor-pointer transition duration-300 ease-in-out">Registration Form</button>
                                    <button onClick={handleLogout} className="font-sans font-semibold text-sm rounded-lg border border-red-500 bg-red-200 px-2 md:rounded-xl mx-2 md:mx-2 hover:bg-red-500 mt-1 mb-1 md:mt-2 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {
                    backup && 
                        <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                            <div className="flex flex-col justify-center select-none font-sans bg-white rounded-xl shadow-xl p-5 border w-75 md:w-98">
                            <p className="text-lg">Sairam! Are you sure to backup the data? This may take a while...</p>
                            <div className="flex flex-row justify-center gap-2">
                                <div className="flex justify-center"><button onClick={handleBackupClick} className="bg-black text-white w-25 rounded-xl mt-2 p-2 hover:cursor-pointer">Backup</button></div>
                                <div className="flex justify-center"><button onClick={() => setBackup(false)} className="bg-black text-white w-25 rounded-xl mt-2 p-2 hover:cursor-pointer">Cancel</button></div>
                            </div>
                            </div>
                        </div>
                }

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
                                    <option>Group 4</option>
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
                                : (searchGroup === "Group 3") ?
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
                                        <option>Quiz</option>
                                        <option>Altar Decoration - Boys</option>
                                        <option>Altar Decoration - Girls</option>
                                        <option>Devotional Singing - Boys</option>
                                        <option>Devotional Singing - Girls</option>
                                        <option>Rudram Namakam Chanting - Boys</option>
                                        <option>Rudram Namakam Chanting - Girls</option>
                                        <option>Rudram Namakam Chanting - Girls</option>
                                    </select>
                                :   
                                    <select value={searchEvent} onChange={(e) => {setSearchEvent(e.target.value)}} className="font-sans border rounded-xl ml-3 lg:mx-10 mt-3 w-69 lg:w-93 h-10 p-2">
                                        <option value="All">All</option>
                                        <option>Quiz</option>
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
                                <option>Group 4</option>
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
                            : (searchGroup === "Group 3") ?
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
                                    <option>Quiz</option>
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
                                    <option>Quiz</option>
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
                    <div className="flex md:flex-row flex-col justify-between pb-4 font-sans font-bold text-2xl">
                        <div></div>
                        <div className="flex justify-center md:ml-12">
                            Details of Registered Students - DLBTS 2026
                        </div>
                        <div className="flex justify-end">
                            <Image className="hover:cursor-pointer" onClick={handleDownload} src={"/download.jpg"} width={30} height={20} alt="download" />
                        </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-300 mx-auto overflow-x-auto lg:w-240 border border-black">
                        <table className="text-center w-357">
                            <thead className="bg-blue-950 text-white">
                                <tr>    
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Attendance</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Name</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Gender</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">DOB</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">DOJ</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Group</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Samithi</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Group 2 Exam</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Event 1</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Event 2</th>
                                    <th className="font-sans px-4 py-2 font-semibold border border-gray-400">Group Event</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                (!loading &&   
                                    studentData.map((student) => (
                                        <tr key={student.id} className={student.attendance === "P" ? "hover:bg-green-200 bg-green-100 transition duration-300 ease-in-out" : "hover:bg-red-200 bg-red-100 transition duration-300 ease-in-out"}>
                                            <td onClick={() => handleAttendance(student.name)} className="font-sans text-xl px-4 py-2 border border-black hover:cursor-pointer select-none">{student.attendance}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.name}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.gender}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.dob}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.doj}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.group}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.samithi}</td>
                                            <td className="font-sans text-xl px-4 py-2 border border-black">{student.grp2Exam}</td>
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