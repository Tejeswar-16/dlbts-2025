"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, where, query, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/app/_util/config";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Register(){

    const [name,setName] = useState("");
    const [doj,setDoj] = useState("");
    const [dob,setDob] = useState("");
    const [grp2Exam,setGrp2Exam] = useState("");
    const [gender,setGender] = useState("");
    const [samithi,setSamithi] = useState("");
    const [group,setGroup] = useState("");
    const [event1,setEvent1] = useState("Select an event");
    const [event2,setEvent2] = useState("Select an event");
    const [groupEvent,setGroupEvent] = useState("Select an event");
    const [loading,setLoading] = useState(false);
    const [errorDoB,setErrorDoB] = useState("");
    const [errorDOJ,setErrorDOJ] = useState("");
    const [errorEvent,setErrorEvent] = useState("");
    const [groupError,setGroupError] = useState("");
    const [genderError,setGenderError] = useState("");
    const [genderError2,setGenderError2] = useState("");
    const [grpGenderError,setGrpGenderError] = useState("");
    const [errorGrp2Exam,setErrorGrp2Exam] = useState("");
    const [email,setEmail] = useState("");
    const [studentData,setStudentData] = useState([]);
    const [clicked,setClicked] = useState(false);

    function handleDojChange(groupValue,joiningDate,dobValue){
        let currentDOJ = new Date(joiningDate);
        let currentDOB = new Date(dobValue);
        let grp1Cutoff = new Date("2025-06-25");
        let grp2Cutoff = new Date("2024-12-25");
        let grp3Cutoff = new Date("2022-12-25"); 
        
        if (currentDOJ<currentDOB)
            setErrorDOJ("Sairam! DOJ cannot be lesser than DOB");
        else
        {
            if (groupValue === "Group 1" && currentDOJ>grp1Cutoff){
            setErrorDOJ("Sairam! For Group 1, student should have been in Balvikas for a minimum period of SIX MONTHS");
            }
            else if (groupValue === "Group 2" && currentDOJ>grp2Cutoff){
                setErrorDOJ("Sairam! For Group 2, student should have been in Balvikas for a minimum period of ONE YEAR");
            }
            else if ((groupValue === "Group 3" || groupValue === "Group 4") && currentDOJ>grp3Cutoff){
                setErrorDOJ("Sairam! For Group 3 & 4, student should have been in Balvikas for a minimum period of THREE YEARS");
            }
            else{
                setErrorDOJ("");
            }
        }
    }

    function handleDobChange(grpValue,dateValue){
        let selectedDate = new Date(dateValue);
        let grp1StartDate = new Date("2016-12-25");
        let grp1EndDate = new Date("2020-12-24");
        let grp2StartDate = new Date("2013-12-25");
        let grp2EndDate = new Date("2016-12-24");
        let grp3StartDate = new Date("2009-12-25");
        let grp3EndDate = new Date("2013-12-24");
        let grp4StartDate = new Date("2007-12-25");
        let grp4EndDate = new Date("2009-12-24");

        if (grpValue === "Group 1" && !(selectedDate>=grp1StartDate && selectedDate<=grp1EndDate)){
            setErrorDoB("Sairam! For Group 1, DoB should be between 25-12-2016 and 24-12-2020");
        }
        else if (grpValue === "Group 2" && !(selectedDate>=grp2StartDate && selectedDate<=grp2EndDate)){
            setErrorDoB("Sairam! For Group 2, DoB should be between 25-12-2013 and 24-12-2016");
        }
        else if (grpValue === "Group 3" && !(selectedDate>=grp3StartDate && selectedDate<=grp3EndDate)){
            setErrorDoB("Sairam! For Group 3, DoB should be between 25-12-2009 and 24-12-2013");
        }
        else if (grpValue === "Group 4" && !(selectedDate>=grp4StartDate && selectedDate<=grp4EndDate)){
            setErrorDoB("Sairam! For Group 4, DoB should be between 25-12-2007 and 24-12-2009");
        }
        else{
            setErrorDoB("");
        }
    }

    function handleEvent2Change(event1Value,event2Value){
        if (event1Value === "Select an event" && event2Value === "Select an event")
            setErrorEvent("");
        else if (event1Value === event2Value)
            setErrorEvent("Sairam! Event 1 and Event 2 cannot be the same");
        else if ((event1Value === "Drawing" && event2Value === "Quiz") || (event1Value === "Quiz" && event2Value === "Drawing"))
            setErrorEvent("Sairam! Students participating in Quiz cannot participate in Drawing and vice-versa");
        else if ((event1Value === "Bhajans" && event2Value === "Tamizh Chants") || (event1Value === "Tamizh Chants" && event2Value === "Bhajans"))
            setErrorEvent("Sairam! Same student cannot participate in both Bhajans and Tamizh Chants");
        else    
            setErrorEvent("");
    }

    function handleGroupChange(event1Value,event2Value,groupValue){
        if (event1Value !== "Select an event" && event2Value !== "Select an event" && groupValue !== "Select an event")
            setGroupError("Sairam! Student cannot participate in two individual events and group event");
        else if ((event1Value === "Drawing" || event2Value === "Drawing") && groupValue !== "Select an event")
            setGroupError("Sairam! Student cannot participate in Drawing and any group event");
        else if ((event1Value === "Quiz" || event2Value === "Quiz") && groupValue !== "Select an event")
            setGroupError("Sairam! Student cannot participate in Quiz and any group event");
        else
            setGroupError("");
    }

    function handleGender1(genderValue,event1Value)
    {
        if (genderValue === "Male" && event1Value.endsWith("Girls"))
            setGenderError("Sairam! Male student cannot particpate in "+event1Value);
        else if (genderValue === "Female" && event1Value.endsWith("Boys"))
            setGenderError("Sairam! Female student cannot participate in "+event1Value);
        else
            setGenderError("");
    }

    function handleGender2(genderValue,event2Value)
    {
        if (genderValue === "Male" && event2Value.endsWith("Girls"))
            setGenderError2("Sairam! Male student cannot particpate in "+event2Value);
        else if (genderValue === "Female" && event2Value.endsWith("Boys"))
            setGenderError2("Sairam! Female student cannot participate in "+event2Value);
        else
            setGenderError2("");
    }

    function handleGrpGender(genderValue,grpValue)
    {
        if (genderValue === "Male" && grpValue.endsWith("Girls"))
            setGrpGenderError("Sairam! Male student cannot particpate in "+grpValue);
        else if (genderValue === "Female" && grpValue.endsWith("Boys"))
            setGrpGenderError("Sairam! Female student cannot participate in "+grpValue);
        else
            setGrpGenderError("");
    }

    function handleGrp2Exam(grp2ExamValue)
    {
        if (grp2ExamValue === "No")
            setErrorGrp2Exam("Sairam! Students participating in Group 3 events should have definitely appeared for the Group 2 exams");
        else
            setErrorGrp2Exam("");
    }

    function cleanName(name) {
        let cleaned = name.replace(/\./g, " ");
        cleaned = cleaned.trim().replace(/\s+/g, " ");
        let parts = cleaned.split(" ");
        parts = parts.filter(word => word.length > 1);
        return parts.join(" ");
    }

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (errorDoB !== "" || errorEvent !== "" || groupError !== "" || genderError !== "" || genderError2 !== "" || grpGenderError !== "" || errorDOJ !== "" || errorGrp2Exam != "") 
        {
            if (errorDoB !== "") 
                alert(errorDoB);
            if (errorEvent !== "") 
                alert(errorEvent);
            if (groupError !== "") 
                alert(groupError);
            if (genderError !== "")
                alert(genderError);
            if (genderError2 !== "")
                alert(genderError2);
            if (grpGenderError !== "")
                alert(grpGenderError);
            if (errorDOJ !== "")
                alert(errorDOJ);
            if (errorGrp2Exam !== "")
                alert(errorGrp2Exam);
        } 
        else 
        {
            if (event1 === "Select an event" && groupEvent === "Select an event")
            {
                alert("Sairam! Kindly select an event");
            }
            else
            {
                try
                {
                    const id = cleanName(name)+dob;
                    setLoading(true);
                    const q = query(
                        collection(db,"studentDetails"),
                        where("id","==",id),
                        where("dob","==",dob),
                    );
                    const querySnapshot = await getDocs(q);
                    if (querySnapshot.empty)
                    {
                        await addDoc(collection(db,"studentDetails"),{
                            id : id,
                            name : name,
                            dob : dob,
                            doj : doj,
                            grp2Exam : grp2Exam !== "" ? grp2Exam : "N/A",
                            gender : gender,
                            samithi : samithi,
                            group : group,
                            event1 : event1,
                            event2 : event2,
                            groupEvent : groupEvent,
                            attendance : "A",
                            timestamp : new Date(),
                            email : email
                        });
                        alert("Sairam! Registered Successfully. Kindly refresh the screen to get the updated data");
                    }
                    else
                    {
                        querySnapshot.forEach(async (document) => {
                            const docRef = doc(db,"studentDetails",document.id);
                            await updateDoc(docRef,{
                                id : id,
                                name : name,
                                dob : dob,
                                doj : doj,
                                grp2Exam : grp2Exam,
                                gender : gender,
                                samithi : samithi,
                                group : group,
                                event1 : event1,
                                event2 : event2,
                                groupEvent : groupEvent,
                                attendance : "A",
                                timestamp : new Date(),
                                email : email
                            });
                        });
                        alert("Sairam! Updated Successfully. Kindly refresh the screen to view the update");
                    }
                }
                catch(error)
                {
                    console.log(error.message);
                }
                finally
                {
                    setName("");
                    setDob("");
                    setDoj("");
                    setGender("");
                    setGrp2Exam("");
                    setSamithi(samithiMap[email]);
                    setGroup("Select a Group");
                    setEvent1("Select an event");
                    setEvent2("Select an event");
                    setGroupEvent("Select an event");
                    setClicked(false);
                    setLoading(false);
                }
            }   
        }
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
            }
        })
    });

    function handleLogout(){
        signOut(auth)
            .then(() => {
                alert("Sairam! Signed out successfully");
                router.push("/");
            })
            .catch((error) => {
                console.log(error);
            })
    }

    let samithiMap = {
        "officials.chengalpet@dlbts.ks" : "Chengalpet",
        "officials.collectorate@dlbts.ks" : "Collectorate",
        "officials.guduvancheri@dlbts.ks" : "Guduvancheri",
        "officials.indranagar@dlbts.ks" : "Indra Nagar",
        "officials.irumbuliyur@dlbts.ks" : "Irumbuliyur",
        "officials.littlekancheepuram@dlbts.ks" : "Little Kancheepuram",
        "officials.madambakkam@dlbts.ks" : "Madambakkam",
        "officials.mainkancheepuram@dlbts.ks" : "Main Kancheepuram",
        "officials.mannivakkam@dlbts.ks" : "Mannivakkam",
        "officials.maraimalainagar@dlbts.ks" : "Maraimalai Nagar",
        "officials.parvathinagar@dlbts.ks" : "Parvathi Nagar",
        "officials.perungalathur@dlbts.ks" : "Perungalathur",
        "officials.poondibazar@dlbts.ks" : "Poondi Bazar",
        "officials.sothupakkam@dlbts.ks" : "Sothupakkam",
        "officials.sriperumpudur@dlbts.ks" : "Sriperumpudur",
        "officials.tambaram@dlbts.ks" : "Tambaram"
    };

    useEffect(() => {
        async function fetchData(){
            setLoading(true);
            const q = query(
                collection(db,"studentDetails")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            let filteredData;
            if (email === "admin@dlbts.ks")
                filteredData = data.filter((fd) => fd.email === email);
            else
                filteredData = data.filter((fd) => fd.samithi === samithiMap[email]);
            filteredData = filteredData.sort((x,y) => x.group.localeCompare(y.group));
            setStudentData(filteredData);
            setLoading(false);
        }
        fetchData();
    },[email]);

    function handleAddStudent(){
        setClicked(true);
        setName("");
        setDob("");
        setDoj("");
        setGender("");
        setGrp2Exam("");
        setSamithi(samithiMap[email]);
        setGroup("Select a Group");
        setEvent1("Select an event");
        setEvent2("Select an event");
        setGroupEvent("Select an event");
    }

    function handleUpdateDetails(nameValue,grpValue,grp2ExamValue,dobValue,dojValue,genderValue,samithiValue,event1Value,event2Value,grpEventValue){
        setClicked(true);
        setName(nameValue);
        setGroup(grpValue);
        setGrp2Exam(grp2ExamValue !== "" ? grp2ExamValue : "N/A");
        setDob(dobValue);
        setDoj(dojValue);
        setGender(genderValue);
        setSamithi(samithiValue);
        setEvent1(event1Value);
        setEvent2(event2Value);
        setGroupEvent(grpEventValue);
    }

    async function handleDeleteStudent(nameVal,dobVal)
    {
        const confirmDelete = window.confirm(`Sairam! Are you sure to delete this student (${nameVal})`)
        if (!confirmDelete)
            return;
        const id = cleanName(nameVal)+dobVal;
        const q = query(
            collection(db,"studentDetails"),
            where("id","==",id)
        );
        const querySnapshot = await getDocs(q);
        const student = querySnapshot.docs[0];
        await deleteDoc((doc(db,"studentDetails",student.id)));
        alert("Deleted sucessfully");
    }

    function handleFormClose(){
        setClicked(false);
    }

    return (
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                {
                    !clicked && 
                    <>
                        <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 pb-1 md:w-180 lg:w-250 lg:h-20">
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-col">
                                    <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, User</h1>
                                    <h1 className="font-sans text-xs md:text-xl px-3">{email}</h1>
                                </div>
                                <div className="flex flex-col md:flex md:flex-row md:justify-end">
                                    <button onClick={handleAddStudent} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl mt-1 mb-1 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Add Student</button>
                                    <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl ml-2 p-1 w-21 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                                </div>
                            </div>
                        </nav>

                        <div className="mx-auto bg-white rounded-xl shadow-lg mt-5 p-4 w-75 md:w-180 lg:w-250">
                            <h1 className="flex justify-center font-sans font-bold text-2xl">Details of Registered Students</h1>
                            <div className="overflow-hidden border border-gray-300 mx-auto overflow-x-auto lg:w-240 border border-black">
                                <table className="mx-auto text-center">
                                    <thead className="bg-blue-950 text-white">
                                        <tr>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Action</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Name</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Group</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Group 2 Exam</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">DOB</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">DOJ</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Gender</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Samithi</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Event 1</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Event 2</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Group Event</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            studentData.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-200 transition duration-300 ease-in-out">
                                                    <td className="font-sans text-lg p-2 border border-black"><button onClick={() => handleUpdateDetails(student.name,student.group,student.grp2Exam,student.dob,student.doj,student.gender,student.samithi,student.event1,student.event2,student.groupEvent)} className="bg-fuchsia-200 p-2 rounded-xl shadow-xl hover:cursor-pointer">Update Details</button></td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.name}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.group}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.grp2Exam}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.dob}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.doj}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.gender}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.samithi}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.event1}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.event2}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.groupEvent}</td>
                                                    <td className="font-sans text-lg p-2 border border-black"><Image onClick={() => handleDeleteStudent(student.name,student.dob)} className="mx-auto hover:cursor-pointer" src="/delete.png" width={30} height={30} alt="Delete Image"></Image></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                }

                {
                    clicked && 
                    <div className="overflow-y-auto flex flex-col justify-center backdrop-blur-sm items-center">
                        <form onSubmit={handleSubmit} className="lg:flex justify-center">
                            <div className={loading ? "blur-sm pointer-events:none" : "mx-auto ml-2 mr-2 mt-10 p-2 mb-10 rounded-2xl shadow-2xl bg-white lg:w-230"}>
                                <div className="flex justify-end font-sans text-2xl font-bold">
                                    <h1 onClick={handleFormClose} className="select-none bg-red-500 text-white p-1 rounded-lg hover:cursor-pointer">X</h1>
                                </div>

                                <div className="flex justify-center font-sans font-bold text-xl md:text-3xl mt-3">
                                    DLBTS Registration Form
                                </div>
                        
                                <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                    <div className="p-4 mt-8 font-sans text-xl">
                                        Student&apos;s Full Name
                                    </div>
                                    <div>
                                        <input value={name} onChange={(e)=>{setName(e.target.value.toUpperCase())}} required className="p-3 mb-4 ml-2 w-68 font-sans text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border" type="text"/>
                                    </div>
                                </div>
                                <div className="mx-auto mt-8 pb-2 rounded-2xl shadow-2xl lg:w-220 bg-gray-100">
                                    <div className="p-4 font-sans text-xl">
                                        Which Group does the student belong to?
                                    </div>
                                    <div>
                                        <input value="Group 1" checked={group === "Group 1"} onChange={(e)=>{setGroup(e.target.value);handleDojChange(e.target.value,doj,dob);handleDobChange(e.target.value,dob)}} required className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                        <label className="font-sans text-lg">Group 1</label><br></br>
                                        <input value="Group 2" checked={group === "Group 2"} onChange={(e)=>{setGroup(e.target.value);handleDojChange(e.target.value,doj,dob);handleDobChange(e.target.value,dob)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                        <label className="font-sans text-lg">Group 2</label><br></br>
                                        <input value="Group 3" checked={group === "Group 3"} onChange={(e)=>{setGroup(e.target.value);handleDojChange(e.target.value,doj,dob);handleDobChange(e.target.value,dob)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                        <label className="font-sans text-lg">Group 3</label><br></br>
                                        <input value="Group 4" checked={group === "Group 4"} onChange={(e)=>{setGroup(e.target.value);handleDojChange(e.target.value,doj,dob);handleDobChange(e.target.value,dob)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                        <label className="font-sans text-lg">Group 4</label>
                                </div>
                                </div>
                                {
                                    (group === "Group 3") && 
                                        <div className="mx-auto mt-8 pb-2 rounded-2xl shadow-2xl lg:w-220 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Has the student appeared for Group 2 Examination?
                                        </div>
                                        <div>
                                            <input value="Yes" checked={grp2Exam === "Yes"} onChange={(e)=>{setGrp2Exam(e.target.value);handleGrp2Exam(e.target.value);}} required className="p-3 mx-4 font-sans text-lg" type="radio" name="group2Exam"/>
                                            <label className="font-sans text-lg">Yes</label><br></br>
                                            <input value="No" checked={grp2Exam === "No"} onChange={(e)=>{setGrp2Exam(e.target.value);handleGrp2Exam(e.target.value);}} className="p-3 mx-4 font-sans text-lg" type="radio" name="group2Exam"/>
                                            <label className="font-sans text-lg">No</label><br></br>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorGrp2Exam}</label>
                                        </div>
                                    </div>
                                }
                                <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                    <div className="p-4 font-sans text-xl">
                                        Student&apos;s Date of Birth (DOB)
                                    </div>
                                    <div>
                                        <input value={dob} onChange={(e)=>{setDob(e.target.value);handleDobChange(group,e.target.value);handleDojChange(group,doj,e.target.value);}} required className="p-3 mb-4 mx-2 font-sans w-68 md:w-180 text-lg w-68 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border" type="date"/>
                                        <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorDoB}</label>
                                    </div>
                                </div>
                                <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                    <div className="p-4 font-sans text-xl">
                                        Student&apos;s Date of Joining (DOJ) Balvikas
                                    </div>
                                    <div>
                                        <input value={doj} onChange={(e)=>{setDoj(e.target.value);handleDojChange(group,e.target.value,dob);}} required className="p-3 mb-4 mx-2 font-sans w-68 md:w-180 text-lg w-68 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border" type="date"/>
                                        <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorDOJ}</label>
                                    </div>
                                </div>
                                <div className="mx-auto mt-8 pb-2 rounded-2xl shadow-2xl lg:w-220 lg:h-35 lg:pb-0 bg-gray-100">
                                    <div className="p-4 font-sans text-xl">
                                        Student&apos;s Gender
                                    </div>
                                    <div>
                                        <input value="Male" checked={gender === "Male"} onChange={(e)=>{setGender(e.target.value);handleGender1(e.target.value,event1);handleGender2(e.target.value,event2);handleGrpGender(e.target.value,groupEvent)}} required className="p-3 mx-4 font-sans text-lg" type="radio" name="gender"/>
                                        <label className="font-sans text-lg">Male</label><br></br>
                                        <input value="Female" checked={gender === "Female"}onChange={(e)=>{setGender(e.target.value);handleGender1(e.target.value,event1);handleGender2(e.target.value,event2);handleGrpGender(e.target.value,groupEvent)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="gender"/>
                                        <label className="font-sans text-lg">Female</label>
                                    </div>
                                </div>
                                <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                    <div className="p-4 font-sans text-xl">
                                        Samithi Name
                                    </div>
                                    <div>
                                        {
                                            (email === "admin@dlbts.ks") ? 
                                                <select value={samithi} onChange={(e) => {setSamithi(e.target.value)}} name="samithi" required className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                    <option value="">Select a Samithi</option>
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
                                            :
                                                <input disabled defaultValue={samithiMap[email]} onChange={(e)=>{setSamithi(e.target.value)}} required className="p-3 mb-4 ml-2 w-68 font-sans text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border" type="text"/>
                                        }
                                    </div>
                                </div>

                                {(group === "Group 1") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 1st event
                                        </div>
                                        <div>
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2);handleGroupChange(e.target.value,event2,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Bhajans</option>
                                                <option>Slokas</option>
                                                <option>Vedam</option>
                                                <option>Tamizh Chants</option>
                                                <option>Story Telling (English)</option>
                                                <option>Story Telling (Tamil)</option>
                                                <option>Drawing</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError}</label>
                                        </div>
                                    </div>
                                : (group === "Group 2") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 1st event
                                        </div>
                                        <div>
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2);handleGender1(gender,e.target.value);handleGroupChange(e.target.value,event2,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
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
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError}</label>
                                        </div>
                                    </div>
                                : (group === "Group 3") ?
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 1st event
                                        </div>
                                        <div>
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2);handleGender1(gender,e.target.value);handleGroupChange(e.target.value,event2,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
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
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError}</label>
                                        </div>
                                    </div>
                                : 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 1st event
                                        </div>
                                        <div>
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2);handleGender1(gender,e.target.value);handleGroupChange(e.target.value,event2,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Quiz</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError}</label>
                                        </div>
                                    </div>
                                }

                                { (group === "Group 1") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 2nd event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(event1,e.target.value);handleGender2(gender,e.target.value);handleGroupChange(event1,e.target.value,groupEvent)}} name="event2" className="p-3 mb-4 mx-2 font-sans text-lg w-68 md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Bhajans</option>
                                                <option>Slokas</option>
                                                <option>Vedam</option>
                                                <option>Tamizh Chants</option>
                                                <option>Story Telling (English)</option>
                                                <option>Story Telling (Tamil)</option>
                                                <option>Drawing</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorEvent}</label>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError2}</label>
                                        </div>
                                    </div>
                                : (group === "Group 2") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 2nd event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(event1,e.target.value);handleGender2(gender,e.target.value);handleGroupChange(event1,e.target.value,groupEvent)}} name="event2" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
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
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorEvent}</label>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError2}</label>
                                        </div>
                                    </div>
                                :   (group === "Group 3") ?
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 2nd event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(event1,e.target.value);handleGender2(gender,e.target.value);handleGroupChange(event1,e.target.value,groupEvent)}} name="event2" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
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
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorEvent}</label>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError2}</label>
                                        </div>
                                    </div>
                                :   <></>
                                }

                                {(group === "Group 1") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 pb-4 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the GROUP events (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(event1,event2,e.target.value);handleGrpGender(gender,e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Devotional Singing - Boys</option>
                                                <option>Devotional Singing - Girls</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{groupError}</label>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{grpGenderError}</label>
                                        </div>
                                    </div>
                                : (group === "Group 2") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 pb-4 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the GROUP events (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(event1,event2,e.target.value);handleGrpGender(gender,e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Altar Decoration - Boys</option>
                                                <option>Altar Decoration - Girls</option>
                                                <option>Devotional Singing - Boys</option>
                                                <option>Devotional Singing - Girls</option>
                                                <option>Rudram Namakam Chanting - Boys</option>
                                                <option>Rudram Namakam Chanting - Girls</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{groupError}</label>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{grpGenderError}</label>
                                        </div>
                                    </div>
                                : (group === "Group 3") ?
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl pb-4 lg:w-220 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the GROUP events (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(event1,event2,e.target.value);handleGrpGender(gender,e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Altar Decoration - Boys</option>
                                                <option>Altar Decoration - Girls</option>
                                                <option>Devotional Singing - Boys</option>
                                                <option>Devotional Singing - Girls</option>
                                                <option>Rudram Namakam Chanting - Boys</option>
                                                <option>Rudram Namakam Chanting - Girls</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{groupError}</label>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{grpGenderError}</label>
                                        </div>
                                    </div>
                                : <></>
                                }

                                <div className="flex justify-center mx-auto mt-7 mb-5 lg:mb-0 lg:mt-12 border rounded-xl lg:rounded-2xl shadow-2xl w-25 h-10 md:w-30 md:h-15 md:text-xl lg:w-35 lg:h-15 bg-gray-200">
                                    <button disabled={loading} type="submit" className="font-sans font-bold text-xl lg:text-2xl rounded-xl lg:rounded-2xl w-25 h-10 md:w-30 md:h-15 lg:w-35 lg:h-15 hover:cursor-pointer hover:bg-black hover:text-white transition duration-300 ease-in-out">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                }

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

            </div>
        </>
    );
}