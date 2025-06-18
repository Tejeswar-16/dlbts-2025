"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, where, query, getDocs } from "firebase/firestore";
import { auth, db } from "../_util/config";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Register(){

    const [name,setName] = useState("");
    const [dob,setDob] = useState("");
    const [gender,setGender] = useState("");
    const [samithi,setSamithi] = useState("");
    const [group,setGroup] = useState("");
    const [event1,setEvent1] = useState("Select an event");
    const [event2,setEvent2] = useState("Select an event");
    const [groupEvent,setGroupEvent] = useState("Select an event");
    const [loading,setLoading] = useState(false);
    const [errorDoB,setErrorDoB] = useState("");
    const [errorEvent,setErrorEvent] = useState("");
    const [groupError,setGroupError] = useState("");
    const [email,setEmail] = useState("");

    function handleDobChange(date){
        let selectedDate = new Date(date);
        let grp1StartDate = new Date("2016-12-25");
        let grp1EndDate = new Date("2020-12-24");
        let grp2StartDate = new Date("2013-12-25");
        let grp2EndDate = new Date("2016-12-24");
        let grp3StartDate = new Date("2009-12-25");
        let grp3EndDate = new Date("2013-12-24");

        if (group === "Group 1" && !(selectedDate>=grp1StartDate && selectedDate<=grp1EndDate)){
            setErrorDoB("Sairam! For Group 1, DoB should be between 25-12-2016 and 24-12-2020");
        }
        else if (group === "Group 2" && !(selectedDate>=grp2StartDate && selectedDate<=grp2EndDate)){
            setErrorDoB("Sairam! For Group 2, DoB should be between 25-12-2013 and 24-12-2016");
        }
        else if (group === "Group 3" && !(selectedDate>=grp3StartDate && selectedDate<=grp3EndDate)){
            setErrorDoB("Sairam! For Group 3, DoB should be between 25-12-2009 and 24-12-2013");
        }
        else{
            setErrorDoB("");
        }
    }

    function handleEvent2Change(event2Value){
        if (event1 === event2Value)
            setErrorEvent("Sairam! Event 1 and Event 2 cannot be the same");
        else    
            setErrorEvent("");
    }

    function handleGroupChange(groupValue){
        if (event1 !== "Select an event" && event2 !== "Select an event" && groupValue !=="Select an event")
            setGroupError("Sairam! Student cannot participate in two individual events and group event");
        else if ((event1 === "Drawing" || event2 === "Drawing") && groupValue !== "")
            setGroupError("Sairam! Student cannot participate in Drawing and any group event")
        else
            setGroupError("");
    }

    function cleanName(name) {
        let cleaned = name.replace(/\./g, " ");
        cleaned = cleaned.trim().replace(/\s+/g, " ");
        let parts = cleaned.split(" ");
        parts = parts.filter(word => word.length > 1);
        return parts.join(" ");
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (errorDoB !== "" || errorEvent !== "" || groupError !== "") 
        {
            if (errorDoB !== "") 
                alert(errorDoB);
            if (errorEvent !== "") 
                alert(errorEvent);
            if (groupError !== "") 
                alert(groupError);
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
                    where("dob","==",dob)
                );
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty)
                {
                    await addDoc(collection(db,"studentDetails"),{
                        id : id,
                        name : name,
                        dob : dob,
                        gender : gender,
                        samithi : samithi,
                        group : group,
                        event1 : event1,
                        event2 : event2,
                        groupEvent : groupEvent,
                        timestamp : new Date()
                    });
                    alert("Sairam! Registered Successfully");
                }
                else
                {
                    alert("Sairam! You have already registered!")
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
                setGender("");
                setSamithi("Select a Samithi");
                setGroup("Select a Group");
                setEvent1("Select an event");
                setEvent2("Select an event");
                setGroupEvent("Select an event");
                setLoading(false);
            }   
        }
    }

    const router = useRouter();

    useEffect(() => {
        const a = auth.onAuthStateChanged((user) => {
            if (!user)
                router.push("/");
        })
    })

    useEffect(() => {
        const a = auth.onAuthStateChanged((user) => {
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
            })
            .catch((error) => {
                console.log(error);
            })
    }

    return (
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 pb-1 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, User</h1>
                            <h1 className="font-sans text-xs md:text-xl px-3">{email}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mr-2 my-4 p-2 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <form onSubmit={handleSubmit} className="lg:flex justify-center">
                    <div className={loading ? "blur-sm pointer-events:none" : "mx-auto ml-2 mr-2 mt-10 p-2 mb-10 rounded-2xl shadow-2xl bg-white lg:w-250 lg:h-400"}>
                        
                        <div className="flex justify-center font-sans font-bold text-xl md:text-3xl mt-3">
                            DLBTS Registration Form
                        </div>
                        
                        <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                            <div className="p-4 mt-8 font-sans text-xl">
                                Student's Full Name
                            </div>
                            <div>
                                <input value={name} onChange={(e)=>{setName(e.target.value.toUpperCase())}} required className="p-3 mb-4 ml-2 w-68 font-sans text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border" type="text"/>
                            </div>
                        </div>
                        <div className="mx-auto mt-8 pb-2 rounded-2xl shadow-2xl lg:w-220 lg:h-40 lg:pb-0 bg-gray-100">
                            <div className="p-4 font-sans text-xl">
                                Which Group does the student belong to?
                            </div>
                            <div>
                                <input value="Group 1" checked={group === "Group 1"} onChange={(e)=>{setGroup(e.target.value)}} required className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                <label className="font-sans text-lg">Group 1</label><br></br>
                                <input value="Group 2" checked={group === "Group 2"} onChange={(e)=>{setGroup(e.target.value)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                <label className="font-sans text-lg">Group 2</label><br></br>
                                <input value="Group 3" checked={group === "Group 3"} onChange={(e)=>{setGroup(e.target.value)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="group"/>
                                <label className="font-sans text-lg">Group 3</label>
                            </div>
                        </div>
                        <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                            <div className="p-4 font-sans text-xl">
                                Student's Date of Birth (DoB)
                            </div>
                            <div>
                                <input value={dob} onChange={(e)=>{setDob(e.target.value);handleDobChange(e.target.value);}} required className="p-3 mb-4 mx-2 font-sans w-68 md:w-180 text-lg w-68 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border" type="date"/>
                                <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorDoB}</label>
                            </div>
                        </div>
                        <div className="mx-auto mt-8 pb-2 rounded-2xl shadow-2xl lg:w-220 lg:h-35 lg:pb-0 bg-gray-100">
                            <div className="p-4 font-sans text-xl">
                                Student's Gender
                            </div>
                            <div>
                                <input value="Male" checked={gender === "Male"} onChange={(e)=>{setGender(e.target.value)}} required className="p-3 mx-4 font-sans text-lg" type="radio" name="gender"/>
                                <label className="font-sans text-lg">Male</label><br></br>
                                <input value="Female" checked={gender === "Female"}onChange={(e)=>{setGender(e.target.value)}} className="p-3 mx-4 font-sans text-lg" type="radio" name="gender"/>
                                <label className="font-sans text-lg">Female</label>
                            </div>
                        </div>
                        <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                            <div className="p-4 font-sans text-xl">
                                Samithi Name
                            </div>
                            <div>
                                <select value={samithi} onChange={(e) => {setSamithi(e.target.value)}} required className="p-3 mb-4 mx-2 font-sans md:w-180 w-68 text-lg lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
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
                            </div>
                        </div>

                        {(group === "Group 1") ? 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the 1st event
                                </div>
                                <div>
                                    <select value={event1} onChange={(e) => {setEvent1(e.target.value)}} required name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
                                        <option>Bhajans</option>
                                        <option>Slokas</option>
                                        <option>Vedam</option>
                                        <option>Tamizh Chants</option>
                                        <option>Story Telling (English)</option>
                                        <option>Story Telling (Tamil)</option>
                                        <option>Drawing</option>
                                    </select>
                                </div>
                            </div>
                        : (group === "Group 2") ? 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the 1st event
                                </div>
                                <div>
                                    <select value={event1} onChange={(e) => {setEvent1(e.target.value)}} required name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
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
                                </div>
                            </div>
                        : 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the 1st event
                                </div>
                                <div>
                                    <select value={event1} onChange={(e) => {setEvent1(e.target.value)}} required name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
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
                                </div>
                            </div>
                        }

                        {(group === "Group 1") ? 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the 2nd event (OPTIONAL)
                                </div>
                                <div>
                                    <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(e.target.value);}} name="event2" className="p-3 mb-4 mx-2 font-sans text-lg w-68 md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
                                        <option>Bhajans</option>
                                        <option>Slokas</option>
                                        <option>Vedam</option>
                                        <option>Tamizh Chants</option>
                                        <option>Story Telling (English)</option>
                                        <option>Story Telling (Tamil)</option>
                                        <option>Drawing</option>
                                    </select>
                                    <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{errorEvent}</label>
                                </div>
                            </div>
                        : (group === "Group 2") ? 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the 2nd event (OPTIONAL)
                                </div>
                                <div>
                                    <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(e.target.value);}} name="event2" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
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
                                </div>
                            </div>
                        : 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the 2nd event (OPTIONAL)
                                </div>
                                <div>
                                    <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(e.target.value);}} name="event2" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
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
                                </div>
                            </div>
                        }

                        {(group === "Group 1") ? 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the GROUP events (OPTIONAL)
                                </div>
                                <div>
                                    <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
                                        <option>Devotional Singing - Boys</option>
                                        <option>Devotional Singing - Girls</option>
                                    </select>
                                    <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{groupError}</label>
                                </div>
                            </div>
                        : (group === "Group 2") ? 
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the GROUP events (OPTIONAL)
                                </div>
                                <div>
                                    <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
                                        <option>Altar Decoration - Boys</option>
                                        <option>Altar Decoration - Girls</option>
                                        <option>Devotional Singing - Boys</option>
                                        <option>Devotional Singing - Girls</option>
                                        <option>Rudram Namakam Chanting - Boys</option>
                                        <option>Rudram Namakam Chanting - Girls</option>
                                    </select>
                                    <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{groupError}</label>
                                </div>
                            </div>
                        :
                            <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                <div className="p-4 font-sans text-xl">
                                    Pick to register for the GROUP events (OPTIONAL)
                                </div>
                                <div>
                                    <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                        <option value="">Select an event</option>
                                        <option>Altar Decoration - Boys</option>
                                        <option>Altar Decoration - Girls</option>
                                        <option>Devotional Singing - Boys</option>
                                        <option>Devotional Singing - Girls</option>
                                        <option>Rudram Namakam Chanting - Boys</option>
                                        <option>Rudram Namakam Chanting - Girls</option>
                                    </select>
                                    <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{groupError}</label>
                                </div>
                            </div>
                        }

                        <div className="flex justify-center mx-auto mt-7 mb-5 lg:mb-0 lg:mt-12 border rounded-xl lg:rounded-2xl shadow-2xl w-25 h-10 md:w-30 md:h-15 md:text-xl lg:w-35 lg:h-15 bg-gray-200">
                           <button disabled={loading} type="submit" className="font-sans font-bold text-xl lg:text-2xl rounded-xl lg:rounded-2xl w-25 h-10 md:w-30 md:h-15 lg:w-35 lg:h-15 hover:cursor-pointer hover:bg-black hover:text-white transition duration-300 ease-in-out">Submit</button>
                        </div>
                    </div>
                </form>

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