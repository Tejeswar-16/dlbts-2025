"use client";

import { auth, db } from "@/app/_util/config";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { query, getDocs, collection, doc, where, updateDoc, addDoc } from "firebase/firestore";
import Image from "next/image";
import { signOut } from "firebase/auth";

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
    const [amDoB,setAmDoB] = useState("");
    const [amGroup,setAmGroup] = useState("");
    const [amGender,setAmGender] = useState("");
    const [amSamithi,setAmSamithi] = useState("");
    const [marks,setMarks] = useState([]);
    const [stcBhaavam,setStcBhaavam] = useState(0);
    const [stcTune,setStcTune] = useState(0);
    const [stcPronunciation,setStcPronunciation] = useState(0);
    const [stcMemory,setStcMemory] = useState(0);
    const [total,setTotal] = useState(0);
    const [bgbBhaavam,setBgbBhaavam] = useState(0);
    const [bgbShruthi,setBgbShruthi] = useState(0);
    const [bgbRagam,setBgbRagam] = useState(0);
    const [bgbTalam,setBgbTalam] = useState(0);
    const [bgbMP,setBgbMP] = useState(0);
    const [bgbTotal,setBgbTotal] = useState(0);
    const [vPronunciation,setvPronunciation] = useState(0);
    const [vBhaavam,setvBhaavam] = useState(0);
    const [vIntonation,setvIntonation] = useState(0);
    const [vMemory,setvMemory] = useState(0);
    const [vTotal,setvTotal] = useState(0);
    const [sPresentation,setsPresentation] = useState(0);
    const [sContent,setsContent] = useState(0);
    const [sLanguage,setsLanguage] = useState(0);
    const [sTotal,setsTotal] = useState(0);
    const [dTheme,setdTheme] = useState(0);
    const [dCC,setdCC] = useState(0);
    const [dLayout,setdLayout] = useState(0);
    const [dTotal,setDTotal] = useState(0);
    const [dsShruthi,setDsShruthi] = useState(0);
    const [dsBhaavam,setDsBhaavam] = useState(0);
    const [dsRagam,setDsRagam] = useState(0);
    const [dsTalam,setDsTalam] = useState(0);
    const [dsMP,setDsMP] = useState(0);
    const [dsHarmony,setDsHarmony] = useState(0);
    const [dsTotal,setDsTotal] = useState(0);
    const [adAsthetics,setAdAesthetics] = useState(0);
    const [adRM,setAdRM] = useState(0);
    const [adTeamwork,setAdTeamwork] = useState(0);
    const [adTotal,setAdTotal] = useState(0);

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
    },[params.group,params.event]);

    useEffect(() => {
        setLoading(true);
        auth.onAuthStateChanged((user) => {
            if (!user)
                router.push("/");
        })
        setLoading(false);
    })

    useEffect(() => {
        setLoading(true);
        auth.onAuthStateChanged((user) => {
            if (user)
            {
                setJudgeEmail(user.email);
                setJudge(cut(user.email).toUpperCase());
            }
        })
        setLoading(false);
    },[cut]);

    //Fetch the student details who have registered for that particular event
    useEffect(() => {
        async function fetchData(){
            setLoading(true);
            const q = query(
                collection(db,"studentDetails")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());

            const filteredData = data.filter((fd) => (fd.group === group && (fd.event1 === event || fd.event2 === event || fd.groupEvent === event)));
            setStudentData(filteredData);
            setLoading(false);
        }
        fetchData();
    },[group,event])

    useEffect(() => {
        setBgbTotal(Number(bgbShruthi)+Number(bgbBhaavam)+Number(bgbRagam)+Number(bgbTalam)+Number(bgbMP));
    },[bgbShruthi,bgbBhaavam,bgbRagam,bgbTalam,bgbMP]);

    useEffect(() => {
        setTotal(Number(stcBhaavam)+Number(stcTune)+Number(stcPronunciation)+Number(stcMemory));
    },[stcBhaavam,stcTune,stcPronunciation,stcMemory]);

    useEffect(() => {
        setvTotal(Number(vBhaavam)+Number(vPronunciation)+Number(vIntonation)+Number(vMemory));
    },[vBhaavam,vPronunciation,vIntonation,vMemory]);

    useEffect(() => {
        setsTotal(Number(sPresentation)+Number(sContent)+Number(sLanguage));
    },[sPresentation,sContent,sLanguage]);

    useEffect(() => {
        setDTotal(Number(dTheme)+Number(dCC)+Number(dLayout));
    },[dTheme,dCC,dLayout]);

    useEffect(() => {
        setDsTotal(Number(dsShruthi)+Number(dsBhaavam)+Number(dsRagam)+Number(dsTalam)+Number(dsMP)+Number(dsHarmony));
    },[dsShruthi,dsBhaavam,dsRagam,dsTalam,dsMP,dsHarmony]);

    useEffect(() => {
        setAdTotal(Number(adAsthetics)+Number(adRM)+Number(adTeamwork));
    },[adAsthetics,adRM,adTeamwork]);

    function cleanName(name) {
        let cleaned = name.replace(/\./g, " ");
        cleaned = cleaned.trim().replace(/\s+/g, " ");
        let parts = cleaned.split(" ");
        parts = parts.filter(word => word.length > 1);
        return parts.join(" ");
    }

    function handleAwardMarks(name,dob,group,gender,samithi){
        setClicked(true);
        setAmName(name);
        setAmDoB(dob);
        setAmGroup(group);
        setAmGender(gender);
        setAmSamithi(samithi);
        const currentId = cleanName(name)+dob+judgeEmail.slice(0,7);
        async function getData(){
            setLoading(true);
            const q = query(
                collection(db,"studentMarks")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            let filteredData = data.filter((fd) => fd.id == currentId && fd.judge == judgeEmail);
            if ((event === "Slokas") || (event === "Slokas - Boys") || (event === "Slokas - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        bhaavam : 0,
                        tune : 0,
                        pronunciation : 0,
                        memory : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setStcBhaavam(mark.bhaavam);
                setStcTune(mark.tune);
                setStcPronunciation(mark.pronunciation);
                setStcMemory(mark.memory);
            }
            else if ((event === "Bhajans") || (event === "Bhajans - Boys") || (event === "Bhajans - Girls"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        bhaavam : 0,
                        shruthi : 0,
                        memory_pronunciation : 0,
                        ragam : 0,
                        talam : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setBgbBhaavam(mark.bhaavam);
                setBgbShruthi(mark.shruthi);
                setBgbRagam(mark.ragam);
                setBgbTalam(mark.talam);
                setBgbMP(mark.memory_pronunciation);
            }
            else if ((event === "Vedam") || (event === "Vedam - Boys") || (event === "Vedam - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        bhaavam : 0,
                        intonation : 0,
                        pronunciation : 0,
                        memory : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setvBhaavam(mark.bhaavam);
                setvPronunciation(mark.pronunciation);
                setvIntonation(mark.intonation);
                setvMemory(mark.memory);
            }
            else if ((event === "Story Telling (English)") || (event === "Story Telling (Tamil)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        presentation : 0,
                        content : 0,
                        language : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setsPresentation(mark.presentation);
                setsContent(mark.content);
                setsLanguage(mark.language);
            }
            else if ((event === "Drawing"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        theme : 0,
                        colour_coordination : 0,
                        layout : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setdTheme(mark.theme);
                setdCC(mark.colour_coordination);
                setdLayout(mark.layout);
            }
            else if ((event === "Devotional Singing - Boys") || (event === "Devotional Singing - Girls"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        shruthi : 0,
                        ragam : 0,
                        talam : 0,
                        memory_pronunciation : 0,
                        bhaavam : 0,
                        harmony : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setDsShruthi(mark.shruthi);
                setDsBhaavam(mark.bhaavam);
                setDsRagam(mark.ragam);
                setDsTalam(mark.talam);
                setDsMP(mark.memory_pronunciation);
                setDsHarmony(mark.harmony);
            }
            else if ((event === "Altar Decoration - Boys") || (event === "Altar Decoration - Girls"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        asthetics : 0,
                        resource_management : 0,
                        teamwork : 0,
                        totalMarks : 0,
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : ""
                    }]
                }
                const mark = filteredData[0];
                setAdAesthetics(mark.asthetics);
                setAdRM(mark.resource_management);
                setAdTeamwork(mark.teamwork);
            }

            setMarks(filteredData);
            setLoading(false);
        }  
        
        getData();
    }

    async function updateMarks(){
        setClicked(false);
        setLoading(true);
        const id = cleanName(amName) + amDoB + judgeEmail.slice(0,7);
        const q = query(
            collection(db,"studentMarks"),
            where("id","==",id),
            where("dob","==",amDoB),
            where("judge","==",judgeEmail)
        );
        const querySnapshot = await getDocs(q);
        if ((event === "Slokas") || (event === "Slokas - Boys") || (event === "Slokas - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        gender : amGender,
                        samithi : amSamithi,
                        event : event,
                        bhaavam : stcBhaavam,
                        tune : stcTune,
                        pronunciation : stcPronunciation,
                        memory : stcMemory,
                        totalMarks : total,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        bhaavam : stcBhaavam,
                        tune : stcTune,
                        pronunciation : stcPronunciation,
                        memory : stcMemory,
                        totalMarks : total,
                        judge : judgeEmail  
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Bhajans") || (event === "Bhajans - Boys") || (event === "Bhajans - Girls"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        bhaavam : bgbBhaavam,
                        shruthi : bgbShruthi,
                        ragam : bgbRagam,
                        talam : bgbTalam,
                        memory_pronunciation : bgbMP,
                        totalMarks : bgbTotal,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        bhaavam : bgbBhaavam,
                        shruthi : bgbShruthi,
                        ragam : bgbRagam,
                        talam : bgbTalam,
                        memory_pronunciation : bgbMP,
                        totalMarks : bgbTotal,
                        judge : judgeEmail  
                });
                alert("Sairam! Marks added successfully!");
            }   
        }
        else if ((event === "Vedam") || (event === "Vedam - Boys") || (event === "Vedam - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        bhaavam : vBhaavam,
                        pronunciation : vPronunciation,
                        intonation : vIntonation,
                        memory : vMemory,
                        totalMarks : vTotal,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        bhaavam : vBhaavam,
                        pronunciation : vPronunciation,
                        intonation : vIntonation,
                        memory : vMemory,
                        totalMarks : vTotal,
                        judge : judgeEmail 
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Story Telling (English)") || (event === "Story Telling (Tamil)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        presentation : sPresentation,
                        content : sContent,
                        language : sLanguage,
                        totalMarks : sTotal,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        presentation : sPresentation,
                        content : sContent,
                        language : sLanguage,
                        totalMarks : sTotal,
                        judge : judgeEmail
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Drawing"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        theme : dTheme,
                        colour_coordination : dCC,
                        layout : dLayout,
                        totalMarks : dTotal,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        theme : dTheme,
                        colour_coordination : dCC,
                        layout : dLayout,
                        totalMarks : dTotal,
                        judge : judgeEmail
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Devotional Singing - Boys") || (event === "Devotional Singing - Girls"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        shruthi : dsShruthi,
                        bhaavam : dsBhaavam,
                        ragam : dsRagam,
                        talam : dsTalam,
                        memory_pronunciation : dsMP,
                        harmony : dsHarmony,
                        totalMarks : dsTotal,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        shruthi : dsShruthi,
                        bhaavam : dsBhaavam,
                        ragam : dsRagam,
                        talam : dsTalam,
                        memory_pronunciation : dsMP,
                        harmony : dsHarmony,
                        totalMarks : dsTotal,
                        judge : judgeEmail
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Altar Decoration - Boys") || (event === "Altar Decoration - Girls"))
        {
            if (!querySnapshot.empty)
            {
                querySnapshot.forEach(async (document) => {
                const docRef = doc(db,"studentMarks",document.id);
                await updateDoc(docRef,{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        asthetics : adAsthetics,
                        resource_management : adRM,
                        teamwork : adTeamwork,
                        totalMarks : adTotal,
                        judge : judgeEmail
                    });
                });
                alert("Sairam! Marks updated successfully!");
            }
            else
            {
                await addDoc(collection(db,"studentMarks"),{
                        id : id,
                        name : amName,
                        dob : amDoB,
                        group : amGroup,
                        samithi : amSamithi,
                        gender : amGender,
                        event : event,
                        asthetics : adAsthetics,
                        resource_management : adRM,
                        teamwork : adTeamwork,
                        totalMarks : adTotal,
                        judge : judgeEmail
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        
        setLoading(false);
    }

    const router = useRouter();
    function handleEventsClick(){
        setLoading(true);
        router.push(`/evaluation/${params.group}/${params.event}/leaderboard`);
        setLoading(false);
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

    function handleClose(){
        setClicked(false);
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
                            <button onClick={handleEventsClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl h-8 mt-2 mx-2 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Leaderboard</button>
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 h-8 mt-3 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="mx-auto bg-white rounded-xl shadow-xl w-75 md:w-180 lg:w-250 mt-5 pb-5">
                    <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-2xl p-2">{group+" --> "+event}</h1>
                    {((event === "Bhajans") || (event === "Bhajans - Boys") || (event === "Bhajans - Girls")) && 
                    
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150">
                            <thead className="bg-blue-950 text-white">
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

                <div className="mx-auto bg-white rounded-xl shadow-xl mt-5 pb-5 w-75 md:w-180 lg:w-250">
                        <h1 className="flex justify-center font-sans font-bold pt-4 pb-4 p-4 text-md md:text-xl">Students Registered for {group}: {event}</h1>
                        <table className="mx-auto text-center w-70 md:w-150 lg:w-150 pb-2">
                            <thead className="bg-blue-950 text-white">
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
                                                <div className="md:flex md:flex-row md:justify-between md:items-center">
                                                    <div>
                                                        <h1 className="font-sans font-bold text-lg lg:text-2xl">{student.name}</h1>
                                                    </div>
                                                    <div className="flex flex-col justify-between items-center mt-2 mb-2 lg:mt-0 lg:mb-0">
                                                        <h1 className="font-sans text-sm lg:text-md">Group: {student.group}</h1>
                                                        <h1 className="font-sans text-sm lg:text-md">Gender: {student.gender}</h1>
                                                        <h1 className="font-sans text-sm lg:text-md">DOB: {student.dob}</h1>
                                                    </div>
                                                    
                                                </div>
                                                {
                                                    (student.event2 !== "Select an event" || student.groupEvent !== "Select an event") && (
                                                        <div className="mt-3 lg:mt-1">
                                                            <h1 className="mx-auto bg-red-100 p-1 rounded-lg text-sm lg:text-md w-40 md:w-100">Participating in two events. Kindly prioritize evaluation</h1>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black"><button onClick={() => {handleAwardMarks(student.name,student.dob,student.group,student.gender,student.samithi)}} className="bg-yellow-200 p-2 rounded-xl shadow-xl hover:cursor-pointer">Award Marks</button></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                </div>

                {
                clicked && ((event === "Slokas") || (event === "Slokas - Boys") || (event === "Slokas - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls")) &&
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={stcBhaavam} onChange={(e) => {setStcBhaavam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Tune</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={stcTune} onChange={(e) => {setStcTune(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Pronunciation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={stcPronunciation} onChange={(e) => {setStcPronunciation(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Memory</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={stcMemory} onChange={(e) => {setStcMemory(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{total} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }  

                {clicked && ((event === "Bhajans") || (event === "Bhajans - Boys") || (event === "Bhajans - Girls")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Shruthi</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={bgbShruthi} onChange={(e) => {setBgbShruthi(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={bgbBhaavam} onChange={(e) => {setBgbBhaavam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Ragam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={bgbRagam} onChange={(e) => {setBgbRagam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Talam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={bgbTalam} onChange={(e) => {setBgbTalam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Memory & Pronunciation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={bgbMP} onChange={(e) => {setBgbMP(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{bgbTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Vedam") || (event === "Vedam - Boys") || (event === "Vedam - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Pronunciation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={vPronunciation} onChange={(e) => {setvPronunciation(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                    <option>11</option>
                                                    <option>12</option>
                                                    <option>13</option>
                                                    <option>14</option>
                                                    <option>15</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={vBhaavam} onChange={(e) => {setvBhaavam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Intonation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={vIntonation} onChange={(e) => {setvIntonation(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                    <option>11</option>
                                                    <option>12</option>
                                                    <option>13</option>
                                                    <option>14</option>
                                                    <option>15</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Memory</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={vMemory} onChange={(e) => {setvMemory(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                    <option>11</option>
                                                    <option>12</option>
                                                    <option>13</option>
                                                    <option>14</option>
                                                    <option>15</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{vTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }
                
                {clicked && ((event === "Story Telling (English)") || (event === "Story Telling (Tamil)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Presentation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={sPresentation} onChange={(e) => {setsPresentation(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Content</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={sContent} onChange={(e) => {setsContent(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Language</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={sLanguage} onChange={(e) => {setsLanguage(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{sTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Drawing")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Theme</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dTheme} onChange={(e) => {setdTheme(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Colour Coordination</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dCC} onChange={(e) => {setdCC(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Layout</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dLayout} onChange={(e) => {setdLayout(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{dTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Devotional Singing - Boys") || (event === "Devotional Singing - Girls")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Shruthi</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dsShruthi} onChange={(e) => {setDsShruthi(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Bhaavam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dsBhaavam} onChange={(e) => {setDsBhaavam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Ragam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dsRagam} onChange={(e) => {setDsRagam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Talam</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dsTalam} onChange={(e) => {setDsTalam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Memory & Pronunciation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dsMP} onChange={(e) => {setDsMP(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Harmony</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={dsHarmony} onChange={(e) => {setDsHarmony(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{dsTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Altar Decoration - Boys") || (event === "Altar Decoration - Girls")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans bg-red-500 text-sm hover:cursor-pointer text-gray-100">X</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <table className="mx-auto text-center w-70 md:w-100 mt-2 mb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Criteria</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Marks</th>
                                    </tr>
                                </thead>
                                {marks.map((mark) => (
                                    <tbody key={mark.id}>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Aesthetics</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={adAsthetics} onChange={(e) => {setAdAesthetics(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Resource Management</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={adRM} onChange={(e) => {setAdRM(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Teamwork</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={adTeamwork} onChange={(e) => {setAdTeamwork(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                    <option>8</option>
                                                    <option>9</option>
                                                    <option>10</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{adTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
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