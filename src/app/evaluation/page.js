"use client";

import { useEffect, useState } from "react";
import { auth } from "../_util/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Evaluation(){

    const [judgeEmail,setJudgeEmail] = useState("");
    const [judge,setJudge] = useState("");
    const [judgeGroup,setJudgeGroup] = useState("");
    const [judgeEvent,setJudgeEvent] = useState("");

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
        auth.onAuthStateChanged((user) => {
            if (!user)
                router.push("/");
        })
    })

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user)
            {
                setJudgeEmail(user.email);
                setJudge(cut(user.email).toUpperCase());
            }
        })
    },[cut]);

    const groupMap =  {
        "g1" : "Group 1",
        "g2" : "Group 2",
        "g3" : "Group 3"
    };

    const eventMap = {
        "bh" : "Bhajans",
        "sl" : "Slokas",
        "ve" : "Vedam",
        "tc" : "Tamizh Chants",
        "ste" : "Story Telling (English)",
        "stt" : "Story Telling (Tamil)",
        "dw" : "Drawing",
        "dsb" : "Devotional Singing - Boys",
        "dsg" : "Devotional Singing - Girls",
        "bb" : "Bhajans - Boys",
        "bg" : "Bhajans - Girls",
        "sb" : "Slokas - Boys",
        "sg" : "Slokas - Girls",
        "vb" : "Vedam - Boys",
        "vg" : "Vedam - Girls",
        "tcb" : "Tamizh chants - Boys",
        "tcg" : "Tamizh chants - Girls",
        "ee" : "Elocution (English)",
        "et" : "Elocution (Tamil)",
        "adb" : "Altar Decoration - Boys",
        "adg" : "Altar Decoration - Girls",
        "ncb" : "Rudram Namakam Chanting - Boys",
        "ncg" : "Rudram Namakam Chanting - Girls"
    }
    
    const router = useRouter();

    function handleOnClick(e){  
        e.preventDefault();
        if (judgeEvent === "")
            alert("Sairam! Please select an event");
        else
        {
            let grp = judgeEmail.substring(7,9);
            let evt = cut(judgeEmail).substring(9);
            if (groupMap[grp] !== judgeGroup || eventMap[evt] != judgeEvent)
            {
                if (judgeEmail === "admin@dlbts.ks")
                    router.push("/evaluation/"+judgeGroup.trim().replace(/[\s-()]/g,'').toLowerCase()+"/"+judgeEvent.trim().replace(/[\s-()]/g,'').toLowerCase());
                else
                    alert("Sairam! You do not have access to visit this page. Please select the correct group and event");
            }
            else
                router.push("/evaluation/"+judgeGroup.trim().replace(/[\s-()]/g,'').toLowerCase()+"/"+judgeEvent.trim().replace(/[\s-()]/g,'').toLowerCase());
        }
    }

    function handleLogout(){
        signOut(auth)
            .then(() => {
                alert("Sairam! Signed out successfully");
            })
            .catch((error) => {
                console.log(error.message);
            })
    }

    return(
        <>
            <div className="relative bg-gray-100 py-5 min-h-screen lg:bg-gray-100">
                <nav className="mx-auto border shadow-xl bg-white rounded-xl w-75 pb-1 md:w-180 lg:w-250 lg:h-20">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-3xl">Welcome, {judge}</h1>
                            <h1 className="font-sans text-sm md:text-xl px-3">{judgeEmail}</h1>
                        </div>
                        <div className="flex flex-col md:flex md:flex-row md:justify-end">
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 my-7 h-10 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="mx-auto bg-white rounded-xl shadow-xl mt-10 w-75 md:w-180 lg:w-250 pt-5 pb-7">
                    <div className="mx-auto bg-green-100 rounded-xl shadow-xl w-70 md:w-170 md:h-11 lg:w-200 lg:h-11">
                        <h1 className="flex justify-center font-sans font-bold text-xl p-4 md:text-lg lg:text-xl md:p-2">Sairam! From the list below, please select the event you will be judging</h1>
                    </div>
                   
                    <div className="mx-auto bg-green-100 rounded-xl shadow-xl mt-10 w-70 md:w-170 lg:w-200 pb-4">
                        <h1 className="font-sans font-bold text-xl mx-5 pt-4">Pick the Group</h1>
                        <select required value={judgeGroup} onChange={(e) => setJudgeGroup(e.target.value)}className="font-sans text-lg rounded-xl border mx-5 mt-3 w-50 h-10 px-2">
                            <option value="">Select a Group</option>
                            <option>Group 1</option>
                            <option>Group 2</option>
                            <option>Group 3</option>
                        </select>

                        {
                            judgeGroup && 
                            <>
                                <h1 className="font-sans font-bold text-xl mx-5 pt-4 pb-2">Pick the Event</h1>
                            {(judgeGroup === "Group 1") ? (
                                <div>
                                    <input value="Bhajans" checked={judgeEvent === "Bhajans"} onChange={(e) => setJudgeEvent(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajans</label><br></br>
                                    <input value="Slokas" checked={judgeEvent === "Slokas"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Slokas</label><br></br>
                                    <input value="Vedam" checked={judgeEvent === "Vedam"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Vedam</label><br></br>
                                    <input value="Tamizh Chants" checked={judgeEvent === "Tamizh Chants"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh Chants</label><br></br>
                                    <input value="Story Telling (English)" checked={judgeEvent === "Story Telling (English)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Story Telling (English)</label><br></br>
                                    <input value="Story Telling (Tamil)" checked={judgeEvent === "Story Telling (Tamil)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Story Telling (Tamil)</label><br></br>
                                    <input value="Drawing" checked={judgeEvent === "Drawing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Drawing</label><br></br>
                                    <input value="Devotional Singing - Boys" checked={judgeEvent === "Devotional Singing - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Devotional Singing - Boys</label><br></br>
                                    <input value="Devotional Singing - Girls" checked={judgeEvent === "Devotional Singing - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Devotional Singing - Girls</label><br></br>
                                </div>)
                            : (judgeGroup === "Group 2") ? (
                                <div>
                                    <input value="Bhajans - Boys" checked={judgeEvent === "Bhajans - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajans - Boys</label><br></br>
                                    <input value="Bhajans - Girls" checked={judgeEvent === "Bhajans - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajans - Girls</label><br></br>
                                    <input value="Slokas - Boys" checked={judgeEvent === "Slokas - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Slokas - Boys</label><br></br>
                                    <input value="Slokas - Girls" checked={judgeEvent === "Slokas - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Slokas - Girls</label><br></br>
                                    <input value="Vedam - Boys" checked={judgeEvent === "Vedam - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Vedam - Boys</label><br></br>
                                    <input value="Vedam - Girls" checked={judgeEvent === "Vedam - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Vedam - Girls</label><br></br>
                                    <input value="Tamizh chants - Boys" checked={judgeEvent === "Tamizh chants - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Boys</label><br></br>
                                    <input value="Tamizh chants - Girls" checked={judgeEvent === "Tamizh chants - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Girls</label><br></br>
                                    <input value="Elocution (English)" checked={judgeEvent === "Elocution (English)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Elocution (English)</label><br></br>
                                    <input value="Elocution (Tamil)" checked={judgeEvent === "Elocution (Tamil)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Elocution (Tamil)</label><br></br>
                                    <input value="Drawing" checked={judgeEvent === "Drawing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Drawing</label><br></br>
                                    <input value="Altar Decoration - Boys" checked={judgeEvent === "Altar Decoration - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Altar Decoration - Boys</label><br></br>
                                    <input value="Altar Decoration - Girls" checked={judgeEvent === "Altar Decoration - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Altar Decoration - Girls</label><br></br>
                                    <input value="Devotional Singing - Boys" checked={judgeEvent === "Devotional Singing - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Devotional Singing - Boys</label><br></br>
                                    <input value="Devotional Singing - Girls" checked={judgeEvent === "Devotional Singing - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Devotional Singing - Girls</label><br></br>
                                    <input value="Rudram Namakam Chanting - Boys" checked={judgeEvent === "Rudram Namakam Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rudram Namakam Chanting - Boys</label><br></br>
                                    <input value="Rudram Namakam Chanting - Girls" checked={judgeEvent === "Rudram Namakam Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rudram Namakam Chanting - Girls</label><br></br>
                                </div> )
                            : 
                                (<div>
                                    <input value="Bhajans - Boys" checked={judgeEvent === "Bhajans - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajans - Boys</label><br></br>
                                    <input value="Bhajans - Girls" checked={judgeEvent === "Bhajans - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajans - Girls</label><br></br>
                                    <input value="Slokas - Boys" checked={judgeEvent === "Slokas - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Slokas - Boys</label><br></br>
                                    <input value="Slokas - Girls" checked={judgeEvent === "Slokas - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Slokas - Girls</label><br></br>
                                    <input value="Vedam - Boys" checked={judgeEvent === "Vedam - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Vedam - Boys</label><br></br>
                                    <input value="Vedam - Girls" checked={judgeEvent === "Vedam - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Vedam - Girls</label><br></br>
                                    <input value="Tamizh chants - Boys" checked={judgeEvent === "Tamizh chants - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Boys</label><br></br>
                                    <input value="Tamizh chants - Girls" checked={judgeEvent === "Tamizh chants - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Girls</label><br></br>
                                    <input value="Elocution (English)" checked={judgeEvent === "Elocution (English)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Elocution (English)</label><br></br>
                                    <input value="Elocution (Tamil)" checked={judgeEvent === "Elocution (Tamil)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Elocution (Tamil)</label><br></br>
                                    <input value="Drawing" checked={judgeEvent === "Drawing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Drawing</label><br></br>
                                    <input value="Altar Decoration - Boys" checked={judgeEvent === "Altar Decoration - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Altar Decoration - Boys</label><br></br>
                                    <input value="Altar Decoration - Girls" checked={judgeEvent === "Altar Decoration - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Altar Decoration - Girls</label><br></br>
                                    <input value="Devotional Singing - Boys" checked={judgeEvent === "Devotional Singing - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Devotional Singing - Boys</label><br></br>
                                    <input value="Devotional Singing - Girls" checked={judgeEvent === "Devotional Singing - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Devotional Singing - Girls</label><br></br>
                                    <input value="Rudram Namakam Chanting - Boys" checked={judgeEvent === "Rudram Namakam Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rudram Namakam Chanting - Boys</label><br></br>
                                    <input value="Rudram Namakam Chanting - Girls" checked={judgeEvent === "Rudram Namakam Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rudram Namakam Chanting - Girls</label><br></br>
                                </div>)
                            }

                            <div className="mx-auto bg-gray-100 w-25 h-15 mt-4 rounded-xl shadow-lg border">
                                <button onClick={handleOnClick} className="font-sans font-bold text-2xl w-25 h-15 rounded-xl shadow-lg hover:cursor-pointer hover:bg-black hover:text-white transition duration-300 ease-in-out" type="submit">Submit</button>
                            </div>
                            </>
                        }
                    </div>

                    
                </div>
            </div>
        </>
    );
}