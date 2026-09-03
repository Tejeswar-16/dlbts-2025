"use client";

import { auth, db } from "@/app/_util/config";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { query, getDocs, collection, doc, where, updateDoc, addDoc } from "firebase/firestore";
import Image from "next/image";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";

export default function Judging(){
    
    const eventMap = {
        "bhajansinging" : "Bhajan Singing",
        "slokachanting" : "Sloka Chanting",
        "vedachanting" : "Veda Chanting",
        "tamizhchants" : "Tamizh Chants",
        "storytellingenglishtamilbilingual" : "Story Telling (English/Tamil/Bilingual)",
        "fancydress" : "Fancy Dress",
        "drawing" : "Drawing",
        "devotionalsingingboys" : "Devotional Singing - Boys",
        "devotionalsinginggirls" : "Devotional Singing - Girls",
        "bhajansingingboys" : "Bhajan Singing - Boys",
        "bhajansinginggirls" : "Bhajan Singing - Girls",
        "slokachantingboys" : "Sloka Chanting - Boys",
        "slokachantinggirls" : "Sloka Chanting - Girls",
        "vedachantingboys" : "Veda Chanting - Boys",
        "vedachantinggirls" : "Veda Chanting - Girls",
        "tamizhchantsboys" : "Tamizh chants - Boys",
        "tamizhchantsgirls" : "Tamizh chants - Girls",
        "justaminuteenglish" : "Just a Minute - English",
        "justaminutetamil" : "Just a Minute - Tamil",
        "silentmonologue" : "Silent Monologue",
        "antarangasai" : "Antaranga Sai",
        "altardecorationboys" : "Altar Decoration - Boys",
        "altardecorationgirls" : "Altar Decoration - Girls",
        "rudramnamakamchantingboys" : "Rudram Namakam Chanting - Boys",
        "rudramnamakamchantinggirls" : "Rudram Namakam Chanting - Girls",
        "quiz" : "Quiz",
        "dumbcharades" : "Dumb Charades",
        "rangoli" : "Rangoli",
        "tedsaienglish" : "Ted Sai - English",
        "tedsaitamil" : "Ted Sai - Tamil",
        "wealthoutofwaste" : "Wealth out of Waste"        
    }

    const lockMap = {
        [`g1sc@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Sloka Chanting"],
        [`g1vc@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Veda Chanting"],
        [`g1tc@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Tamizh Chants"],
        [`g1st@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Story Telling (English/Tamil/Bilingual)"],
        [`g1fd@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Fancy Dress"],
        [`g1dw@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Drawing"],
        [`g1bh@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 1","Bhajan Singing"],

        [`g2sb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Sloka Chanting - Boys"],
        [`g2sg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Sloka Chanting - Girls"],
        [`g2vb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Veda Chanting - Boys"],
        [`g2vg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Veda Chanting - Girls"],
        [`g2tcb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Tamizh chants - Boys"],
        [`g2tcg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Tamizh chants - Girls"],
        [`g2jame@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Just a Minute - English"],
        [`g2jamt@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Just a Minute - Tamil"],
        [`g2dw@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Drawing"],
        [`g2bb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Bhajan Singing - Boys"],
        [`g2bg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 2","Bhajan Singing - Girls"],

        [`g3sb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Sloka Chanting - Boys"],
        [`g3sg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Sloka Chanting - Girls"],
        [`g3vb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Veda Chanting - Boys"],
        [`g3vg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Veda Chanting - Girls"],
        [`g3tcb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Tamizh chants - Boys"],
        [`g3tcg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Tamizh chants - Girls"],
        [`g3tse@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Ted Sai - English"],
        [`g3tst@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Ted Sai - Tamil"],
        [`g3dw@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Drawing"],
        [`g3bb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Bhajan Singing - Boys"],
        [`g3bg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group 3","Bhajan Singing - Girls"],

        [`tequ@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Team Events","Quiz"],
        [`terg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Team Events","Rangoli"],
        [`tedc@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Team Events","Dumb Charades"],
        [`teww@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Team Events","Wealth out of Waste"],

        [`geadb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group Events","Altar Decoration - Boys"],
        [`geadg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group Events","Altar Decoration - Girls"],
        [`gencb@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group Events","Rudram Namakam Chanting - Boys"],
        [`gencg@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`] : ["Group Events","Rudram Namakam Chanting - Girls"],
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
    const [stcRemarks,setStcRemarks] = useState("");
    const [total,setTotal] = useState(0);
    const [bgbBhaavam,setBgbBhaavam] = useState(0);
    const [bgbShruthi,setBgbShruthi] = useState(0);
    const [bgbRagam,setBgbRagam] = useState(0);
    const [bgbTalam,setBgbTalam] = useState(0);
    const [bgbMP,setBgbMP] = useState(0);
    const [bgbTotal,setBgbTotal] = useState(0);
    const [bgbRemarks,setBgbRemarks] = useState("");
    const [vPronunciation,setvPronunciation] = useState(0);
    const [vBhaavam,setvBhaavam] = useState(0);
    const [vIntonation,setvIntonation] = useState(0);
    const [vMemory,setvMemory] = useState(0);
    const [vTotal,setvTotal] = useState(0);
    const [vRemarks,setVRemarks] = useState("");
    const [sPresentation,setsPresentation] = useState(0);
    const [sContent,setsContent] = useState(0);
    const [sLanguage,setsLanguage] = useState(0);
    const [sTotal,setsTotal] = useState(0);
    const [sRemarks,setSRemarks] = useState("");
    const [dTheme,setdTheme] = useState(0);
    const [dCC,setdCC] = useState(0);
    const [dLayout,setdLayout] = useState(0);
    const [dTotal,setDTotal] = useState(0);
    const [dRemarks,setDRemarks] = useState("");
    const [dsShruthi,setDsShruthi] = useState(0);
    const [dsBhaavam,setDsBhaavam] = useState(0);
    const [dsRagam,setDsRagam] = useState(0);
    const [dsTalam,setDsTalam] = useState(0);
    const [dsMP,setDsMP] = useState(0);
    const [dsHarmony,setDsHarmony] = useState(0);
    const [dsTotal,setDsTotal] = useState(0);
    const [dsRemarks,setDsRemarks] = useState("");
    const [adAsthetics,setAdAesthetics] = useState(0);
    const [adRM,setAdRM] = useState(0);
    const [adTeamwork,setAdTeamwork] = useState(0);
    const [adTotal,setAdTotal] = useState(0);
    const [adRemarks,setAdRemarks] = useState("");
    const [qMark,setQMark] = useState(0);
    const [qRemarks,setQRemarks] = useState("");
    const [fdCharRep,setFdCharRep] = useState("");
    const [fdExpDel,setFdExpDel] = useState("");
    const [fdContRel,setFdContRel] = useState("");
    const [fdTotal,setFdTotal] = useState("");
    const [fdRemarks,setFdRemarks] = useState("");
    const [jamcont,setJamCont] = useState("");
    const [jamlangflu,setJamLangFlu] = useState("");
    const [jamoverall,setJamOverall] = useState("");
    const [jamTotal,setJamTotal] = useState("");
    const [jamRemarks,setJamRemarks] = useState("");
    const [tscontrel,setTsContRel] = useState("");
    const [tspersConn,setTsPersConn] = useState("");
    const [tsexpDel,setTsExpDel] = useState("");
    const [tsLanFlu,setTsLanFlu] = useState("");
    const [tsTotal,setTsTotal] = useState("");
    const [tsRemarks,setTsRemarks] = useState("");
    const [disabled,setDisabled] = useState(false);
    const [groupEventData,setGroupEventData] = useState([]);
    const [tedcAccurateSaying,setTeDcAccurateSaying] = useState("");
    const [tedcTotal,setTeDcTotal] = useState("");
    const [tedcRemarks,setTeDcRemarks] = useState("");
    const [wowCreativity,setWowCreativity] = useState("");
    const [wowWastage,setWowWastage] = useState("");
    const [wowUtility,setWowUtility] = useState("");
    const [wowNeatness,setWowNeatness] = useState("");
    const [wowTeamWork,setWowTeamWork] = useState("");
    const [wowTotal,setWowTotal] = useState("");
    const [wowRemarks,setWowRemarks] = useState("");
    const [rgCreativity,setRgCreativity] = useState("");
    const [rgTheme,setRgTheme] = useState("");
    const [rgColor,setRgColor] = useState("");
    const [rgSymmetry,setRgSymmety] = useState("");
    const [rgTeam,setRgTeam] = useState("");
    const [rgTotal,setRgTotal] = useState("");
    const [rgRemarks,setRgRemarks] = useState("");

    function uncut(a)
    {
        if (a === "groupevents")
            return "Group Events";
        else if (a === "teamevents")
            return "Team Events";
        else
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
                if (user.email === `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`)
                    setDisabled(true);
            }
        })
        setLoading(false);
    },[cut]);

    //Fetch the student details who have registered for that particular event
    useEffect(() => {
        async function fetchData(){
            setLoading(true);
            const q = query(
                collection(db,"studentDetails"),
                where("attendance","==","P")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());

            let filteredData;
            if (event === "Altar Decoration - Boys")
            {
                filteredData = data.filter((fd) => ((fd.group === "Group 1" || fd.group === "Group 2" || fd.group === "Group 3") && fd.groupEvent === "Altar Decoration - Boys"));
            }
            else if (event === "Altar Decoration - Girls")
            {
                filteredData = data.filter((fd) => ((fd.group === "Group 1" || fd.group === "Group 2" || fd.group === "Group 3") && fd.groupEvent === "Altar Decoration - Girls"));
            }
            else if (event === "Rudram Namakam Chanting - Boys")
            {
                filteredData = data.filter((fd) => ((fd.group === "Group 1" || fd.group === "Group 2" || fd.group === "Group 3") && fd.groupEvent === "Rudram Namakam Chanting - Boys"));
            }
            else if (event === "Rudram Namakam Chanting - Girls")
            {
                filteredData = data.filter((fd) => ((fd.group === "Group 1" || fd.group === "Group 2" || fd.group === "Group 3") && fd.groupEvent === "Rudram Namakam Chanting - Girls"));
            }
            else 
            {
                filteredData = data.filter((fd) => (fd.group === group && (fd.event1 === event || fd.event2 === event)));
            }
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

    useEffect(() => {
        setFdTotal(Number(fdCharRep)+Number(fdContRel)+Number(fdExpDel));
    },[fdCharRep,fdContRel,fdExpDel]);

    useEffect(() => {
        setJamTotal(Number(jamcont)+Number(jamlangflu)+Number(jamoverall));
    },[jamcont,jamlangflu,jamoverall]);

    useEffect(() => {
        setTsTotal(Number(tsLanFlu)+Number(tscontrel)+Number(tsexpDel)+Number(tspersConn));
    },[tsLanFlu,tscontrel,tsexpDel,tspersConn]);

    useEffect(() => {
        setTeDcTotal(Number(tedcAccurateSaying)*5);
    },[tedcAccurateSaying]);

    useEffect(() => {
        setWowTotal(Number(wowCreativity)+Number(wowNeatness)+Number(wowTeamWork)+Number(wowUtility)+Number(wowWastage));
    },[wowCreativity,wowNeatness,wowTeamWork,wowUtility,wowWastage]);

    useEffect(() => {
        setRgTotal(Number(rgCreativity)+Number(rgColor)+Number(rgSymmetry)+Number(rgTheme)+Number(rgTeam));
    },[rgCreativity,rgColor,rgSymmetry,rgTheme,rgTeam]);

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
        const currentId = cleanName(name)+dob+judgeEmail.slice(0,7)+event;
        async function getData(){
            setLoading(true);
            const q = query(
                collection(db,"studentMarks")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            let filteredData = data.filter((fd) => fd.id == currentId && fd.judge == judgeEmail);
            if ((event === "Sloka Chanting") || (event === "Sloka Chanting - Boys") || (event === "Sloka Chanting - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls"))
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
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setStcBhaavam(mark.bhaavam);
                setStcTune(mark.tune);
                setStcPronunciation(mark.pronunciation);
                setStcMemory(mark.memory);
                setStcRemarks(mark.remarks);
            }
            else if ((event === "Bhajan Singing") || (event === "Bhajan Singing - Boys") || (event === "Bhajan Singing - Girls"))
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
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setBgbBhaavam(mark.bhaavam);
                setBgbShruthi(mark.shruthi);
                setBgbRagam(mark.ragam);
                setBgbTalam(mark.talam);
                setBgbMP(mark.memory_pronunciation);
                setBgbRemarks(mark.remarks);
            }
            else if ((event === "Veda Chanting") || (event === "Veda Chanting - Boys") || (event === "Veda Chanting - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls"))
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
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setvBhaavam(mark.bhaavam);
                setvPronunciation(mark.pronunciation);
                setvIntonation(mark.intonation);
                setvMemory(mark.memory);
                setVRemarks(mark.remarks);
            }
            else if ((event === "Story Telling (English/Tamil/Bilingual)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        presentation : 0,
                        content : 0,
                        language : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setsPresentation(mark.presentation);
                setsContent(mark.content);
                setsLanguage(mark.language);
                setSRemarks(mark.remarks);
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
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setdTheme(mark.theme);
                setdCC(mark.colour_coordination);
                setdLayout(mark.layout);
                setDRemarks(mark.remarks);
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
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setDsShruthi(mark.shruthi);
                setDsBhaavam(mark.bhaavam);
                setDsRagam(mark.ragam);
                setDsTalam(mark.talam);
                setDsMP(mark.memory_pronunciation);
                setDsHarmony(mark.harmony);
                setDsRemarks(mark.remarks);
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
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setAdAesthetics(mark.asthetics);
                setAdRM(mark.resource_management);
                setAdTeamwork(mark.teamwork);
                setAdRemarks(mark.remarks);
            }
            else if ((event === "Quiz"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setQMark(mark.totalMarks);
                setQRemarks(mark.remarks);
            }
            else if ((event === "Fancy Dress"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        character_representation : 0,
                        expression_delivery : 0,
                        content_relevance : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setFdCharRep(mark.character_representation);
                setFdExpDel(mark.expression_delivery);
                setFdContRel(mark.content_relevance);
                setFdRemarks(mark.remarks);
            }
            else if ((event === "Just a Minute - English") || (event === "Just a Minute - Tamil"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        content : 0,
                        language_fluency : 0,
                        overall_presentation : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setJamCont(mark.content);
                setJamLangFlu(mark.language_fluency);
                setJamOverall(mark.overall_presentation);
                setJamRemarks(mark.remarks);
            }
            else if ((event === "Ted Sai - English") || (event === "Ted Sai - Tamil"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        content_relevance : 0,
                        personal_connection : 0,
                        expression_delivery : 0,
                        language_fluency : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setTsContRel(mark.content_relevance);
                setTsPersConn(mark.personal_connection);
                setTsExpDel(mark.expression_delivery);
                setTsLanFlu(mark.language_fluency);
                setTsRemarks(mark.remarks);
            }
            else if ((event === "Dumb Charades"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        accurate_sayings : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setTeDcAccurateSaying(mark.accurate_sayings);
                setTeDcRemarks(mark.remarks);
            }
            else if ((event === "Wealth out of Waste"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        creativity_uniqueness : 0,
                        wastage_minimisation : 0,
                        utility_practicality : 0,
                        neatness_finish : 0,
                        team_work : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setWowCreativity(mark.creativity_uniqueness);
                setWowWastage(mark.wastage_minimisation);
                setWowUtility(mark.utility_practicality);
                setWowNeatness(mark.neatness_finish);
                setWowTeamWork(mark.team_work);
                setWowRemarks(mark.remarks);
            }
            else if ((event === "Rangoli"))
            {
                if (filteredData.length === 0)
                {
                    filteredData = [{
                        id : "",
                        theme_relevance : 0,
                        creativity : 0,
                        colour_combination : 0,
                        symmetry : 0,
                        team_coordination : 0,
                        totalMarks : 0,
                        remarks: "",
                        dob : "",
                        event : "",
                        gender : "",
                        group : "",
                        name : "",
                        samithi : "",
                        judge : "",
                        lock : ""
                    }]
                }
                const mark = filteredData[0];
                setRgTheme(mark.theme_relevance);
                setRgCreativity(mark.creativity);
                setRgColor(mark.colour_combination);
                setRgSymmety(mark.symmetry);
                setRgTeam(mark.team_coordination);
                setRgRemarks(mark.remarks);
            }
            setMarks(filteredData);
            setLoading(false);
        }  
        
        getData();
    }

    async function updateMarks(){
        setClicked(false);
        setLoading(true);
        const id = cleanName(amName) + amDoB + judgeEmail.slice(0,7) + event;
        const q = query(
            collection(db,"studentMarks"),
            where("id","==",id),
            where("dob","==",amDoB),
            where("judge","==",judgeEmail)
        );
        const querySnapshot = await getDocs(q);
        if ((event === "Sloka Chanting") || (event === "Sloka Chanting - Boys") || (event === "Sloka Chanting - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls"))
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
                        remarks: stcRemarks,
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
                        remarks: stcRemarks,
                        judge : judgeEmail,
                        lock : ""  
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Bhajan Singing") || (event === "Bhajan Singing - Boys") || (event === "Bhajan Singing - Girls"))
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
                        remarks: bgbRemarks,
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
                        remarks: bgbRemarks,
                        judge : judgeEmail,
                        lock : ""  
                });
                alert("Sairam! Marks added successfully!");
            }   
        }
        else if ((event === "Veda Chanting") || (event === "Veda Chanting - Boys") || (event === "Veda Chanting - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls"))
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
                        remarks: vRemarks,
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
                        remarks: vRemarks,
                        judge : judgeEmail,
                        lock : "" 
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Story Telling (English/Tamil/Bilingual)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)"))
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
                        remarks: sRemarks,
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
                        remarks: sRemarks,
                        judge : judgeEmail,
                        lock : ""
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
                        remarks: dRemarks,
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
                        remarks: dRemarks,
                        judge : judgeEmail,
                        lock : ""
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
                        remarks: dsRemarks,
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
                        remarks: dsRemarks,
                        judge : judgeEmail,
                        lock : ""
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
                        remarks: adRemarks,
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
                        remarks: adRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Quiz"))
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
                        totalMarks : qMark,
                        remarks: qRemarks,
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
                        totalMarks : qMark,
                        remarks: qRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Fancy Dress"))
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
                        character_representation : fdCharRep,
                        expression_delivery : fdExpDel,
                        content_relevance : fdContRel,
                        totalMarks : fdTotal,
                        remarks: fdRemarks,
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
                        character_representation : fdCharRep,
                        expression_delivery : fdExpDel,
                        content_relevance : fdContRel,
                        totalMarks : fdTotal,
                        remarks: fdRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Just a Minute - English") || (event === "Just a Minute - Tamil"))
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
                        content : jamcont,
                        language_fluency : jamlangflu,
                        overall_presentation : jamoverall,
                        totalMarks : jamTotal,
                        remarks: jamRemarks,
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
                        content : jamcont,
                        language_fluency : jamlangflu,
                        overall_presentation : jamoverall,
                        totalMarks : jamTotal,
                        remarks: jamRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Ted Sai - English") || (event === "Ted Sai - Tamil"))
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
                        content_relevance : tscontrel,
                        personal_connection : tspersConn,
                        expression_delivery : tsexpDel,
                        language_fluency : tsLanFlu,
                        totalMarks : tsTotal,
                        remarks: tsRemarks,
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
                        content_relevance : tscontrel,
                        personal_connection : tspersConn,
                        expression_delivery : tsexpDel,
                        language_fluency : tsLanFlu,
                        totalMarks : tsTotal,
                        remarks: tsRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Dumb Charades"))
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
                        accurate_sayings : tedcAccurateSaying,
                        totalMarks : tedcTotal,
                        remarks: tedcRemarks,
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
                        accurate_sayings : tedcAccurateSaying,
                        totalMarks : tedcTotal,
                        remarks: tedcRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Wealth out of Waste"))
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
                        creativity_uniqueness : wowCreativity,
                        wastage_minimisation : wowWastage,
                        utility_practicality : wowUtility,
                        neatness_finish : wowNeatness,
                        team_work : wowTeamWork,
                        totalMarks : wowTotal,
                        remarks: wowRemarks,
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
                        creativity_uniqueness : wowCreativity,
                        wastage_minimisation : wowWastage,
                        utility_practicality : wowUtility,
                        neatness_finish : wowNeatness,
                        team_work : wowTeamWork,
                        totalMarks : wowTotal,
                        remarks: wowRemarks,
                        judge : judgeEmail,
                        lock : ""
                });
                alert("Sairam! Marks added successfully!");
            }
        }
        else if ((event === "Rangoli"))
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
                        theme_relevance : rgTheme,
                        creativity : rgCreativity,
                        colour_combination : rgColor,
                        symmetry : rgSymmetry,
                        team_coordination : rgTeam,
                        totalMarks : rgTotal,
                        remarks: rgRemarks,
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
                        theme_relevance : rgTheme,
                        creativity : rgCreativity,
                        colour_combination : rgColor,
                        symmetry : rgSymmetry,
                        team_coordination : rgTeam,
                        totalMarks : rgTotal,
                        remarks: rgRemarks,
                        judge : judgeEmail,
                        lock : ""
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
                router.push("/");
            })
            .catch((error) => {
                console.log(error.message);
            })
    }

    function handleClose(){
        setClicked(false);
    }

    useEffect(() => {
        async function fetchLock(){
            if (judgeEmail)
            {
                const q = query(
                        collection(db,"eventLock"),
                        where("group","==",lockMap[judgeEmail.slice(7)][0]),
                        where("event","==",lockMap[judgeEmail.slice(7)][1])
                    );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map((doc) => doc.data());
                if (data.length !== 0)
                {
                    if (data[0].lock === "true")
                    {
                        setDisabled(true);
                    }
                }           
            }
        }
        fetchLock();
    },[judgeEmail]);

    function handleDownload(){
        let event = eventMap[params.event];
        let group = uncut(params.group);
        let criteria = []
        if (event === "Bhajans" || event === "Bhajans - Boys" || event === "Bhajans - Girls"){
            criteria.push({"Criteria":"Shruthi","Marks":"10"},{"Criteria":"Bhavam","Marks":"10"},{"Criteria":"Ragam","Marks":"10"},{"Criteria":"Talam","Marks":"10"},{"Criteria":"Memory & Pronunciation","Marks":10});
        }
        else if ((event === "Slokas") || (event === "Slokas - Boys") || (event === "Slokas - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls")){
            criteria.push({"Criteria":"Bhavam","Marks":"5"},{"Criteria":"Tune","Marks":"5"},{"Criteria":"Pronunciation","Marks":"10"},{"Criteria":"Memory","Marks":"10"});
        }
        else if ((event === "Vedam") || (event === "Vedam - Boys") || (event === "Vedam - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls")){
            criteria.push({"Criteria":"Pronunciation","Marks":"15"},{"Criteria":"Bhavam","Marks":"5"},{"Criteria":"Intonation","Marks":"15"},{"Criteria":"Memory","Marks":"15"});
        }
        else if ((event === "Story Telling (English)") || (event === "Story Telling (Tamil)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)")){
            criteria.push({"Criteria":"Presentation","Marks":"10"},{"Criteria":"Content","Marks":"10"},{"Criteria":"Language","Marks":"10"});
        }
        else if (event === "Drawing"){
            criteria.push({"Criteria":"Theme","Marks":"10"},{"Criteria":"Colour Coordination","Marks":"10"},{"Criteria":"Layout","Marks":"10"});
        }
        else if ((event === "Devotional Singing - Boys") || (event === "Devotional Singing - Girls")){
            criteria.push({"Criteria":"Shruthi","Marks":"10"},{"Criteria":"Bhavam","Marks":"10"},{"Criteria":"Ragam","Marks":"10"},{"Criteria":"Talam","Marks":"10"},{"Criteria":"Memory & Pronunciation","Marks":10},{"Criteria":"Harmony","Marks":10});
        }
        else if ((event === "Altar Decoration - Boys") || (event === "Altar Decoration - Girls")){
            criteria.push({"Criteria":"Aesthetics","Marks":"10"},{"Criteria":"Resource Management","Marks":"10"},{"Criteria":"Teamwork","Marks":"10"});
        }

        const filteredStudentData = studentData.map((student) => ({
            "Name" : student.name,
            "Group" : student.group,
            "Gender" : student.gender,
            "DOB" : student.dob
        }));
        const final = [...criteria,{},...filteredStudentData];
        const worksheet = XLSX.utils.json_to_sheet(final,{skipHeader:true});
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook,worksheet,"Students");
        XLSX.writeFile(workbook,group.toLowerCase()+"-"+event.toLowerCase()+".xlsx");
    }

    async function fetchGroupEvents(){
        try{
            setLoading(true);
            const q = query(
                collection(db,"studentDetails"),
                where("attendance","==","P")
            );
            const presentSnapshot = await getDocs(q);
            const presentIds = new Set(presentSnapshot.docs.map((doc) => doc.id));
            const qry = query(
                collection(db,"groupEventTeams"),
                where("eventName","==",event)
            );
            const teamsSnapshot = await getDocs(qry);
            const teams = teamsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            const teamsWithAttendance = teams.map((team) => ({
                ...team,
                members: (team.members || []).map((member) => ({
                    ...member,
                    present: presentIds.has(member.studentId)
                }))
            }))
            .filter((team) =>
                team.members.some((member) => member.present)
            );
            setGroupEventData(teamsWithAttendance)
        }
        catch(err){
            console.error(err);
            alert("Unable to fetch group event attendance");
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if (event) {
            fetchGroupEvents();
        }
    },[event]);

    const samithis = JSON.parse(
        process.env.NEXT_PUBLIC_DISTRICTS || "[]"
    );

    useEffect(() => {
        const initial = {};
        samithis.forEach((samithi) => {
            initial[`${samithi}: Team A`] = [];
            initial[`${samithi}: Team B`] = [];
        });
        if (groupEventData.length !== 0){
            for (const team  of groupEventData){
                const teamSamithi = team.samithi;
                const key = `${teamSamithi}: ${team.teamName}`;
                if (initial[key]){
                    initial[key].push(team);
                }
            }
        }
    },[groupEventData]);
    
    
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
                            <button onClick={handleDownload} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-fuchsia-200 px-2 md:rounded-xl h-8 mt-2 mr-1 md:h-15 md:mx-2 md:my-2 hover:bg-fuchsia-500 hover:cursor-pointer transition duration-300 ease-in-out">Download</button>
                            <button onClick={handleEventsClick} className="font-sans font-semibold text-md md:text-xl rounded-lg bg-yellow-100 px-2 md:rounded-xl h-8 mt-2 mr-1 md:h-15 md:mx-2 md:my-2 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Leaderboard</button>
                            <button onClick={handleLogout} className="font-sans font-semibold text-sm md:text-xl rounded-lg bg-red-200 px-2 md:rounded-xl mx-2 h-8 mt-3 md:h-15 md:mx-2 md:my-2 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="mx-auto bg-white rounded-xl shadow-xl w-75 md:w-180 lg:w-250 mt-5 pb-5">
                    <h1 className="mx-auto flex justify-center items-center font-sans text-center font-bold text-md md:text-xl lg:text-2xl p-2">{group+" --> "+event}</h1>
                    {((event === "Bhajan Singing") || (event === "Bhajan Singing - Boys") || (event === "Bhajan Singing - Girls")) && 
                    
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

                    {((event === "Sloka Chanting") || (event === "Sloka Chanting - Boys") || (event === "Sloka Chanting - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls")) && 
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

                    {((event === "Veda Chanting") || (event === "Veda Chanting - Boys") || (event === "Veda Chanting - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls")) && 
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

                    {((event === "Story Telling (English/Tamil/Bilingual)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)")) && 
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

                    {((event === "Rangoli")) && 
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
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Theme Relevance</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Creativity</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Colour Combination </td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Symmetry</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Team Coordination</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">40 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Fancy Dress")) && 
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
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Character Representation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Expression and Delivery</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Content and Relevance</td>
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

                    {((event === "Ted Sai - English") || (event === "Ted Sai - Tamil")) && 
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
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Content & Relevance</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Personal Connection</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Expression & Delivery</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Language & Fluency</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">30 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Just a Minute - English") || (event === "Just a Minute - Tamil")) && 
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
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Content</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Language & Fluency</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Overall Presentation</td>
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

                    {((event === "Wealth out of Waste")) && 
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
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Creativity & Uniqueness</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Wastage Minimisation</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Utility/Practicality</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Neatness and Finish</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Team Work</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">5</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                    <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">40 marks</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    }

                    {((event === "Dumb Charades")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <h1 className="flex justify-center text-blue-900 bg-gray-200 rounded-xl shadow-xl mx-4 text-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Each successfully identified saying will be awarded 5 marks. The total score will be determined by the number of accurate Sayings identified, multiplied by 5</h1>
                    </>
                    }

                    {((event === "Quiz")) && 
                    <>
                        <h1 className="flex justify-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Evaluation Criteria</h1>
                        <h1 className="flex justify-center text-blue-900 bg-gray-200 rounded-xl shadow-xl mx-4 text-center font-sans font-bold text-md md:text-xl lg:text-xl p-2">Assessed through general round, audio visual round, and rapid fire round.</h1>
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
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Accuracy</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Layout</td>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">10</td>
                                </tr>
                                <tr>
                                    <td className="font-sans px-2 py-2 font-semibold border border-black">Colouring</td>
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
                        <h1 className="flex justify-center font-sans text-center font-bold pt-4 pb-4 p-4 text-md md:text-xl">Students Registered for {group}: {event}</h1>
                        <div className="overflow-hidden overflow-x-auto">
                            <table className="mx-auto text-center w-70 md:w-150 lg:w-150 pb-2">
                                <thead className="bg-blue-950 text-white">
                                    <tr>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Student Details</th>
                                        <th className="font-sans px-2 py-2 font-semibold border border-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        (judgeEmail.slice(7,9) !== "ge" && judgeEmail.slice(7,9) !== "te") &&
                                        studentData.map((student) => {
                                            let count = 0;
                                            if (student.event1 !== "N/A")
                                                count += 1
                                            if (student.event2 !== "N/A")
                                                count += 1
                                            if (student.teamEvent !== "N/A")
                                                count += 1
                                            if (student.groupEvent !== "N/A")
                                                count += 1
                                            return (
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
                                                        (count > 1) && (
                                                            <div className="mt-3 lg:mt-1">
                                                                <h1 className="mx-auto bg-red-100 p-1 rounded-lg text-sm lg:text-md w-40 md:w-100">Participating in {count} events. Kindly prioritize evaluation</h1>
                                                            </div>
                                                        )
                                                    }
                                                </td>
                                                <td className="font-sans px-2 py-2 border border-black"><button disabled={disabled} onClick={() => {handleAwardMarks(student.name,student.dob,student.group,student.gender,student.samithi)}} className={!disabled ? `bg-yellow-200 p-2 rounded-xl font-semibold shadow-xl hover:cursor-pointer` : `bg-gray-200 p-2 rounded-xl shadow-xl hover:cursor-not-allowed`}>Award Marks</button></td>
                                            </tr>
                                        )})
                                    }
                                    {
                                        ((judgeEmail.slice(7,9) === "ge" || judgeEmail.slice(7,9) === "te")) && 
                                        groupEventData.filter((group) => group.members && group.members.length > 0)
                                        .map((group) => (
                                            <tr key={group.id}>
                                                <td className="font-sans px-2 py-4 font-semibold border border-black">
                                                    <div className="md:flex md:flex-row md:justify-between md:items-center">
                                                        <div>
                                                            <h1 className="font-sans font-bold text-lg mx-auto flex justify-center items-center lg:text-xl">{group.teamName.toUpperCase()}</h1>
                                                        </div>
                                                        <div className="flex flex-col justify-between items-center mt-2 mb-2 lg:mt-0 lg:mb-0">
                                                            {
                                                                group.members.map((student,index) => (
                                                                    <div key={index} className="border p-2 m-2 rounded-lg shadow-lg shadow-gray-500">
                                                                        <h1 className="font-sans text-sm lg:text-md">Name: {student.name} ({student.present ? "Present" : "Absent"})</h1>
                                                                        <h1 className="font-sans text-sm lg:text-md">Group: {student.group}</h1>
                                                                        <h1 className="font-sans text-sm lg:text-md">Gender: {student.gender}</h1>
                                                                        <h1 className="font-sans text-sm lg:text-md">DOB: {student.dob}</h1>
                                                                    </div>                                                                
                                                                ))
                                                            }
                                                        </div>                                                        
                                                    </div>
                                                </td>
                                                <td className="font-sans px-2 py-2 border border-black"><button disabled={disabled} onClick={() => {handleAwardMarks(group.members.map((s) => s.name).join(", ") ,group.members.map((s) => s.dob).join(", "),group.members.map((s) => s.group).join(", "),group.members[0].gender,group.samithi)}} className={!disabled ? `bg-yellow-200 p-2 rounded-lg font-semibold shadow-lg shadow-yellow-100 hover:cursor-pointer` : `bg-gray-200 p-2 rounded-xl shadow-xl hover:cursor-not-allowed`}>Award Marks</button></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                </div>

                {
                clicked && ((event === "Sloka Chanting") || (event === "Sloka Chanting - Boys") || (event === "Sloka Chanting - Girls") || (event === "Tamizh Chants") || (event === "Tamizh chants - Boys") || (event === "Tamizh chants - Girls")) &&
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                <textarea value={stcRemarks} onChange={(e)=>{setStcRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }  

                {clicked && ((event === "Bhajan Singing") || (event === "Bhajan Singing - Boys") || (event === "Bhajan Singing - Girls")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                <textarea value={bgbRemarks} onChange={(e)=>{setBgbRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Veda Chanting") || (event === "Veda Chanting - Boys") || (event === "Veda Chanting - Girls") || (event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            {   
                                ((event === "Rudram Namakam Chanting - Boys") || (event === "Rudram Namakam Chanting - Girls")) ?
                                    <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Samithi Name: {amSamithi}</h1>
                                :
                                    <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            }
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
                                <textarea value={vRemarks} onChange={(e)=>{setVRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }
                
                {clicked && ((event === "Story Telling (English/Tamil/Bilingual)") || (event === "Elocution (English)") || (event === "Elocution (Tamil)")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                <textarea value={sRemarks} onChange={(e)=>{setSRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
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
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                <textarea value={dRemarks} onChange={(e)=>{setDRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Fancy Dress")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Character Representation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={fdCharRep} onChange={(e) => {setFdCharRep(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Expression and Delivery</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={fdExpDel} onChange={(e) => {setFdExpDel(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Content and Relevance</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={fdContRel} onChange={(e) => {setFdContRel(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{fdTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <textarea value={fdRemarks} onChange={(e)=>{setFdRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Wealth out of Waste")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Creativity & Uniqueness</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={wowCreativity} onChange={(e) => {setWowCreativity(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Wastage Minimisation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={wowWastage} onChange={(e) => {setWowWastage(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Utility/Practicality</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={wowUtility} onChange={(e) => {setWowUtility(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Neatness and Finish</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={wowNeatness} onChange={(e) => {setWowNeatness(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Team Work</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={wowTeamWork} onChange={(e) => {setWowTeamWork(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{wowTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <textarea value={wowRemarks} onChange={(e)=>{setWowRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Just a Minute - English") || (event === "Just a Minute - Tamil")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Content</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={jamcont} onChange={(e) => {setJamCont(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Language & Fluency</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={jamlangflu} onChange={(e) => {setJamLangFlu(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Overall Presentation</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={jamoverall} onChange={(e) => {setJamOverall(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{jamTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <textarea value={jamRemarks} onChange={(e)=>{setJamRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && ((event === "Ted Sai - English") || (event === "Ted Sai - Tamil")) && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Content & Relevance</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={tscontrel} onChange={(e) => {setTsContRel(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Personal Connection</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={tspersConn} onChange={(e) => {setTsPersConn(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Expression & Delivery</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={tsexpDel} onChange={(e) => {setTsExpDel(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Language & Fluency</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={tsLanFlu} onChange={(e) => {setTsLanFlu(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{tsTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <textarea value={tsRemarks} onChange={(e)=>{setTsRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
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
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Samithi Name: {amSamithi}</h1>
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
                                <textarea value={dsRemarks} onChange={(e)=>{setDsRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
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
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Samithi Name: {amSamithi}</h1>
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
                                <textarea value={adRemarks} onChange={(e)=>{setAdRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="flex justify-center font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && (event === "Quiz") && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <div className="flex justify-center flex-col justify-center items-center">
                                <h1 className="font-sans text-xl mt-2 font-semibold">Enter the marks</h1>
                                <input value={qMark} onChange={(e) => setQMark(e.target.value)} className="font-sans rounded-xl border md:w-100 p-2 w-70 mx-4 mb-4" type="number" placeholder="Enter the marks here..."></input>
                            </div>
                            <div className="flex justify-center">
                                <textarea value={qRemarks} onChange={(e)=>{setQRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && (event === "Dumb Charades") && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Student Name: {amName}</h1>
                            <div className="flex justify-center items-center flex-col">
                                <h1 className="font-bold mt-4">Enter the number of accurate sayings</h1>
                                <input value={tedcAccurateSaying} onChange={(e) => setTeDcAccurateSaying(e.target.value)} className="font-sans rounded-xl border p-2 w-70 md:w-100 mx-4 mb-2" type="number" placeholder="Enter the marks here..."></input>
                            </div>
                            <div className="flex justify-center">
                                <textarea value={tedcRemarks} onChange={(e)=>{setTeDcRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
                            <div className="flex justify-center">
                                <h1 className="font-bold text-xl">Total Marks: {tedcTotal}</h1>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {updateMarks()}} className="font-sans bg-green-200 rounded-xl hover:cursor-pointer font-semibold text-lg p-2 mb-2">Update Marks</button>
                            </div>
                        </div>
                    </div>
                }

                {clicked && (event === "Rangoli") && 
                    <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="bg-white w-75 md:w-125 rounded-xl shadow-xl">
                            <div className="flex justify-end pt-2 pr-2">
                                <button onClick={handleClose} className="rounded-md p-1 font-sans text-sm hover:cursor-pointer text-gray-100">❌</button>
                            </div>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Award Marks</h1>
                            <h1 className="flex justify-center font-sans font-bold text-lg md:text-xl pt-2">Samithi Name: {amSamithi}</h1>
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Theme Relevance</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={rgTheme} onChange={(e) => {setRgTheme(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Creativity</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={rgCreativity} onChange={(e) => {setRgCreativity(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Colour Combination</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={rgColor} onChange={(e) => {setRgColor(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Symmetry</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={rgSymmetry} onChange={(e) => {setRgSymmety(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">Team Coordination</td>
                                            <td className="font-sans px-2 py-2 font-semibold border border-black">
                                                <select value={rgTeam} onChange={(e) => {setRgTeam(e.target.value)}} name="marks" className="w-20 border rounded-xl p-2">
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
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">TOTAL</td>
                                            <td className="font-sans px-2 py-2 font-semibold border bg-gray-200 border-black">{rgTotal} marks</td>
                                        </tr>
                                    </tbody>
                                ))}
                            </table>
                            <div className="flex justify-center">
                                <textarea value={rgRemarks} onChange={(e)=>{setRgRemarks(e.target.value)}} type="text" maxLength={100} placeholder="Enter your remarks here (max 100 characters)" className="resize-none font-sans p-2 mb-2 rounded-xl w-70 h-30 md:w-100 md:h-20 border"></textarea>
                            </div>
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