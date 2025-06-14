"use client";

import { useEffect, useState } from "react";
import Logistics from "./Logistics";
import Image from "next/image";
import { db } from "./_util/config";
import { collection, where, query, getCountFromServer} from "firebase/firestore";

export default function LogisticsList(){
    
    const [totalMale,setTotalMale] = useState(0);
    const [totalFemale,setTotalFemale] = useState(0);
    const [totalStudents,setTotalStudents] = useState(0);
    const [grp1Male,setGrp1Male] = useState(0);
    const [grp1Female,setGrp1Female] = useState(0);
    const [grp1Total,setGrp1Total] = useState(0);
    const [grp2Male,setGrp2Male] = useState(0);
    const [grp2Female,setGrp2Female] = useState(0);
    const [grp2Total,setGrp2Total] = useState(0);
    const [grp3Male,setGrp3Male] = useState(0);    
    const [grp3Female,setGrp3Female] = useState(0);
    const [grp3Total,setGrp3Total] = useState(0);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        async function fetchData(){
            setLoading(true);

            const q = [
                getCountFromServer(query(collection(db,"studentDetails"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("gender","==","Male"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("gender","==","Female"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 1"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 1"),where("gender","==","Male"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 1"),where("gender","==","Female"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 2"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 2"),where("gender","==","Male"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 2"),where("gender","==","Female"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 3"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 3"),where("gender","==","Male"))),
                getCountFromServer(query(collection(db,"studentDetails"),where("group","==","Group 3"),where("gender","==","Female"))),
            ]

            const result = await Promise.all(q);

            setTotalStudents(result[0].data().count);
            setTotalMale(result[1].data().count);
            setTotalFemale(result[2].data().count);
            setGrp1Total(result[3].data().count);
            setGrp1Male(result[4].data().count);
            setGrp1Female(result[5].data().count);
            setGrp2Total(result[6].data().count);
            setGrp2Male(result[7].data().count);
            setGrp2Female(result[8].data().count);
            setGrp3Total(result[9].data().count);
            setGrp3Male(result[10].data().count);
            setGrp3Female(result[11].data().count);

            setLoading(false);
        }
        fetchData();
    },[]);

    const students = [
        {
            "heading" : "Total Students",
            "maleCount" : totalMale,
            "femaleCount" : totalFemale,
            "totalCount" : totalStudents
        },
        {
            "heading" : "Group 1 Students",
            "maleCount" : grp1Male,
            "femaleCount" : grp1Female,
            "totalCount" : grp1Total
        },
        {
            "heading" : "Group 2 Students",
            "maleCount" : grp2Male,
            "femaleCount" : grp2Female,
            "totalCount" : grp2Total
        },
        {
            "heading" : "Group 3 Students",
            "maleCount" : grp3Male,
            "femaleCount" : grp3Female,
            "totalCount" : grp3Total
        }
    ]
    
    return (
        <>
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
            <div className="flex flex-wrap lg:justify-center">
                {students.map((student) => (
                    <div key={student.heading} className="w-full md:w-1/2 lg:w-[250px]">
                        <Logistics key={student.heading} heading={student.heading} maleCount={student.maleCount} femaleCount={student.femaleCount} totalCount={student.totalCount}></Logistics>
                    </div>
                ))}  
            </div>
        </>
    );
}