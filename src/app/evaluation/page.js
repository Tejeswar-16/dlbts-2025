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

    const router = useRouter();

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (!user)
                router.push("/");
        })
    },[router])

    useEffect(() => {
        const a = auth.onAuthStateChanged((user) => {
            if (user)
            {
                if ((user.email).startsWith("officials"))
                {
                    alert("Sairam! You do not have access to visit Evaluation Page. Please login with correct credentials");
                    router.push("/");
                }
            }
        });
        return () => {
            a();
        }
    },[router]);

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
        "g3" : "Group 3",
        "te" : "Team Events",
        "ge" : "Group Events"
    };

    const eventMap = {
        "sc" : "Sloka Chanting",
        "vc" : "Veda Chanting",
        "tc" : "Tamizh Chants",
        "st" : "Story Telling (English/Tamil/Bilingual)",
        "fd" : "Fancy Dress",
        "bh" : "Bhajan Singing",
        "dw" : "Drawing",

        "sb" : "Sloka Chanting - Boys",
        "sg" : "Sloka Chanting - Girls",
        "vb" : "Veda Chanting - Boys",
        "vg" : "Veda Chanting - Girls",
        "tcb" : "Tamizh chants - Boys",
        "tcg" : "Tamizh chants - Girls",
        "jame" : "Just a Minute - English",
        "jamt" : "Just a Minute - Tamil",

        "tse" : "Ted Sai - English",
        "tst" : "Ted Sai - Tamil",
        "dlb" : "Dual Lens - Boys",
        "dlg" : "Dual Lens - Girls",
        "tan" : "Then and Now",

        "bb" : "Bhajan Singing - Boys",
        "bg" : "Bhajan Singing - Girls",
        "rg" : "Rangoli",
        "dc" : "Dumb Charades",

        "adb" : "Altar Decoration - Boys",
        "adg" : "Altar Decoration - Girls",
        "ncb" : "Rudram Namakam Chanting - Boys",
        "ncg" : "Rudram Namakam Chanting - Girls",
        "qu" : "Quiz",
        "ww" : "Wealth out of Waste"
    }

    function handleOnClick(e){  
        e.preventDefault();
        if (judgeEvent === "")
            alert("Sairam! Please select an event");
        else
        {   
            let grp = judgeEmail.substring(7,9);
            let evt = cut(judgeEmail).substring(9);
            console.log(grp,evt)
            if (groupMap[grp] !== judgeGroup || eventMap[evt] !== judgeEvent)
            {
                if (judgeEmail === "admin@dlbts.ks")
                    router.push("/evaluation/"+judgeGroup.trim().replace(/[\s-()]/g,'').toLowerCase()+"/"+judgeEvent.trim().replace(/[\s-()/]/g,'').toLowerCase());
                else
                    alert("Sairam! You do not have access to visit this page. Please select the correct group and event");
            }
            else
                router.push("/evaluation/"+judgeGroup.trim().replace(/[\s-()]/g,'').toLowerCase()+"/"+judgeEvent.trim().replace(/[\s-()/]/g,'').toLowerCase());
        }
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
                            <option>Team Events</option>
                            <option>Group Events</option>
                        </select>
                        {/* <option>Dumb Charades</option>
                                                <option>Wealth out of Waste</option>
                                                <option>Quiz</option>
                                                <option>Rangoli</option> */}
                        {
                            judgeGroup && 
                            <>
                                <h1 className="font-sans font-bold text-xl mx-5 pt-4 pb-2">Pick the Event</h1>
                            {(judgeGroup === "Group 1") ? (
                                <div>
                                    <input value="Sloka Chanting" checked={judgeEvent === "Sloka Chanting"} onChange={(e) => setJudgeEvent(e.target.value)} required className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Sloka Chanting</label><br></br>

                                    <input value="Veda Chanting" checked={judgeEvent === "Veda Chanting"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Veda Chanting</label><br></br>

                                    <input value="Tamizh Chants" checked={judgeEvent === "Tamizh Chants"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh Chants</label><br></br>

                                    <input value="Story Telling (English/Tamil/Bilingual)" checked={judgeEvent === "Story Telling (English/Tamil/Bilingual)"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Story Telling (English/Tamil/Bilingual)</label><br></br>

                                    <input value="Fancy Dress" checked={judgeEvent === "Fancy Dress"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Fancy Dress</label><br></br>

                                    <input value="Drawing" checked={judgeEvent === "Drawing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Drawing</label><br></br>

                                    <input value="Bhajan Singing" checked={judgeEvent === "Bhajan Singing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajan Singing</label><br></br>
                                </div>)
                            : (judgeGroup === "Group 2") ? (
                                <div>
                                    <input value="Sloka Chanting - Boys" checked={judgeEvent === "Sloka Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Sloka Chanting - Boys</label><br></br>

                                    <input value="Sloka Chanting - Girls" checked={judgeEvent === "Sloka Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Sloka Chanting - Girls</label><br></br>

                                    <input value="Veda Chanting - Boys" checked={judgeEvent === "Veda Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Veda Chanting - Boys</label><br></br>

                                    <input value="Veda Chanting - Girls" checked={judgeEvent === "Veda Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Veda Chanting - Girls</label><br></br>

                                    <input value="Tamizh chants - Boys" checked={judgeEvent === "Tamizh chants - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Boys</label><br></br>

                                    <input value="Tamizh chants - Girls" checked={judgeEvent === "Tamizh chants - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Girls</label><br></br>

                                    <input value="Just a Minute - English" checked={judgeEvent === "Just a Minute - English"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Just a Minute - English</label><br></br>

                                    <input value="Just a Minute - Tamil" checked={judgeEvent === "Just a Minute - Tamil"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Just a Minute - Tamil</label><br></br>

                                    <input value="Drawing" checked={judgeEvent === "Drawing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Drawing</label><br></br>

                                    <input value="Bhajan Singing - Boys" checked={judgeEvent === "Bhajan Singing - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajan Singing - Boys</label><br></br>

                                    <input value="Bhajan Singing - Girls" checked={judgeEvent === "Bhajan Singing - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajan Singing - Girls</label><br></br>
                                </div> )
                            :  (judgeGroup === "Group 3") ? (
                                <div>
                                    <input value="Sloka Chanting - Boys" checked={judgeEvent === "Sloka Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Sloka Chanting - Boys</label><br></br>

                                    <input value="Sloka Chanting - Girls" checked={judgeEvent === "Sloka Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Sloka Chanting - Girls</label><br></br>

                                    <input value="Veda Chanting - Boys" checked={judgeEvent === "Veda Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Veda Chanting - Boys</label><br></br>

                                    <input value="Veda Chanting - Girls" checked={judgeEvent === "Veda Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Veda Chanting - Girls</label><br></br>

                                    <input value="Tamizh chants - Boys" checked={judgeEvent === "Tamizh chants - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Boys</label><br></br>

                                    <input value="Tamizh chants - Girls" checked={judgeEvent === "Tamizh chants - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Tamizh chants - Girls</label><br></br>

                                    <input value="Ted Sai - English" checked={judgeEvent === "Ted Sai - English"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Ted Sai - English</label><br></br>

                                    <input value="Ted Sai - Tamil" checked={judgeEvent === "Ted Sai - Tamil"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Ted Sai - Tamil</label><br></br>

                                    <input value="Drawing" checked={judgeEvent === "Drawing"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Drawing</label><br></br>

                                    <input value="Bhajan Singing - Boys" checked={judgeEvent === "Bhajan Singing - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajan Singing - Boys</label><br></br>

                                    <input value="Bhajan Singing - Girls" checked={judgeEvent === "Bhajan Singing - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Bhajan Singing - Girls</label><br></br>
                                </div>)
                            :  (judgeGroup === "Team Events") ?
                                <div>
                                    <input value="Wealth out of Waste" checked={judgeEvent === "Wealth out of Waste"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Wealth out of Waste</label><br></br>

                                    <input value="Dumb Charades" checked={judgeEvent === "Dumb Charades"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Dumb Charades</label><br></br>

                                    <input value="Rangoli" checked={judgeEvent === "Rangoli"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rangoli</label><br></br>

                                    <input value="Quiz" checked={judgeEvent === "Quiz"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Quiz</label><br></br>
                                </div>

                            :   
                                <div>
                                    <input value="Altar Decoration - Boys" checked={judgeEvent === "Altar Decoration - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Altar Decoration - Boys</label><br></br>

                                    <input value="Altar Decoration - Girls" checked={judgeEvent === "Altar Decoration - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Altar Decoration - Girls</label><br></br>
                                    
                                    <input value="Rudram Namakam Chanting - Boys" checked={judgeEvent === "Rudram Namakam Chanting - Boys"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rudram Namakam Chanting - Boys</label><br></br>

                                    <input value="Rudram Namakam Chanting - Girls" checked={judgeEvent === "Rudram Namakam Chanting - Girls"} onChange={(e) => setJudgeEvent(e.target.value)} className="p-3 mx-5 font-sans text-lg" type="radio" name="event"/>
                                    <label className="font-sans text-lg">Rudram Namakam Chanting - Girls</label><br></br>
                                </div>
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