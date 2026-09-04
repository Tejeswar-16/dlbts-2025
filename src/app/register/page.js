"use client";

import { useEffect, useState } from "react";
import { collection, setDoc, addDoc, where, query, getDocs, updateDoc, doc, deleteDoc,serverTimestamp  } from "firebase/firestore";
import { auth, db } from "@/app/_util/config";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function Register(){

    const [studentDocId, setStudentDocId] = useState(null);
    const [name,setName] = useState("");
    const [doj,setDoj] = useState("");
    const [dob,setDob] = useState("");
    const [grp2Exam,setGrp2Exam] = useState("");
    const [gender,setGender] = useState("");
    const [samithi,setSamithi] = useState("");
    const [group,setGroup] = useState("");
    const [event1,setEvent1] = useState("Select an event");
    const [event2,setEvent2] = useState("Select an event");
    const [teamEvent,setTeamEvent] = useState("Select an event");
    const [groupEvent,setGroupEvent] = useState("Select an event");
    const [loading,setLoading] = useState(false);
    const [errorDoB,setErrorDoB] = useState("");
    const [errorDOJ,setErrorDOJ] = useState("");
    const [errorEvent,setErrorEvent] = useState("");
    const [teamError,setTeamError] = useState("");
    const [groupError,setGroupError] = useState("");
    const [genderError,setGenderError] = useState("");
    const [genderError2,setGenderError2] = useState("");
    const [grpGenderError,setGrpGenderError] = useState("");
    const [errorGrp2Exam,setErrorGrp2Exam] = useState("");
    const [email,setEmail] = useState("");
    const [studentData,setStudentData] = useState([]);
    const [clicked,setClicked] = useState(false);
    const [close,setClose] = useState("");
    const [manageGrpEvent,setManageGrpEvent] = useState(false);
    const [selectedGrpEvent, setSelectedGrpEvent] = useState("");
    const [grpEventStudents, setGrpEventStudents] = useState([]);
    const [grpEventLoading, setGrpEventLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [teamName, setTeamName] = useState("");
    const [eventTeams, setEventTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [savingTeam, setSavingTeam] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const MIN_TEAM_SIZE_AD = 2;
    const MIN_TEAM_SIZE_NC = 2;
    const MAX_TEAM_SIZE_AD = 4;
    const MAX_TEAM_SIZE_NC = 3;
    const MAX_TEAMS_PER_EVENT = 2;

    function handleDojChange(groupValue,joiningDate,dobValue){
        let currentDOJ = new Date(joiningDate);
        let currentDOB = new Date(dobValue);
        let grp1Cutoff = new Date("2026-06-25");
        let grp2Cutoff = new Date("2025-12-25");
        let grp3Cutoff = new Date("2023-12-25"); 
        
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
        let grp1StartDate = new Date("2017-12-25");
        let grp1EndDate = new Date("2021-12-24");
        let grp2StartDate = new Date("2014-12-25");
        let grp2EndDate = new Date("2017-12-24");
        let grp3StartDate = new Date("2010-12-25");
        let grp3EndDate = new Date("2014-12-24");
        let grp4StartDate = new Date("2008-12-25");
        let grp4EndDate = new Date("2010-12-24");

        if (grpValue === "Group 1" && !(selectedDate>=grp1StartDate && selectedDate<=grp1EndDate)){
            setErrorDoB("Sairam! For Group 1, DoB should be between 25-12-2017 and 24-12-2021");
        }
        else if (grpValue === "Group 2" && !(selectedDate>=grp2StartDate && selectedDate<=grp2EndDate)){
            setErrorDoB("Sairam! For Group 2, DoB should be between 25-12-2014 and 24-12-2017");
        }
        else if (grpValue === "Group 3" && !(selectedDate>=grp3StartDate && selectedDate<=grp3EndDate)){
            setErrorDoB("Sairam! For Group 3, DoB should be between 25-12-2010 and 24-12-2014");
        }
        else if (grpValue === "Group 4" && !(selectedDate>=grp4StartDate && selectedDate<=grp4EndDate)){
            setErrorDoB("Sairam! For Group 4, DoB should be between 25-12-2008 and 24-12-2010");
        }
        else{
            setErrorDoB("");
        }
    }

    function handleEvent2Change(event1Value,event2Value,teamEventValue){
        if (event1Value === "Select an event" && event2Value === "Select an event"){
            setErrorEvent("");
            return;
        }
        if (event1Value === event2Value){
            setErrorEvent("Sairam! Event 1 and Event 2 cannot be the same");
            return;
        }
        if ((event1Value === "Drawing" || event2Value === "Drawing") && teamEventValue === "Quiz"){
            setErrorEvent("Sairam! Students participating in Quiz cannot participate in Drawing and vice-versa");
            return;
        }
        setErrorEvent("");
    }

    function handleGroupChange(event1Value,event2Value,teamEventValue,groupValue){
        const individualCount = (event1Value !== "Select an event" ? 1 : 0) + (event2Value !== "Select an event" ? 1 : 0);
        const teamCount = teamEventValue !== "Select an event" ? 1 : 0;
        const groupCount = groupValue !== "Select an event" ? 1 : 0;
        
        if ((event1Value === "Drawing" || event2Value === "Drawing") && groupValue !== "Select an event")
            setGroupError("Sairam! Student cannot participate in Drawing and any group event");
        else if ((event1Value === "Quiz" || event2Value === "Quiz") && groupValue !== "Select an event")
            setGroupError("Sairam! Student cannot participate in Quiz and any group event");
        else 
            setGroupError("");
        
        const valid = 
            (individualCount === 1 && teamCount === 1 && groupCount === 1) ||
            (individualCount === 2 && teamCount === 0 && groupCount === 1) ||
            (individualCount === 2 && teamCount === 1 && groupCount === 0) ||

            (individualCount === 1 && teamCount === 0 && groupCount === 0) ||
            (individualCount === 0 && teamCount === 1 && groupCount === 0) ||
            (individualCount === 0 && teamCount === 0 && groupCount === 1) ||
            
            (individualCount === 2 && teamCount === 0 && groupCount === 0) ||
            (individualCount === 1 && teamCount === 0 && groupCount === 1) ||
            (individualCount === 0 && teamCount === 1 && groupCount === 1) ||
            (individualCount === 1 && teamCount === 1 && groupCount === 0)
    
        if (valid)
            setGroupError("");
        else
            setGroupError("Sairam! Invalid Event Selection");
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

    function handleTeamGender(genderValue,teamValue)
    {
        if (genderValue === "Male" && teamValue.endsWith("Girls"))
            setTeamError("Sairam! Male student cannot particpate in "+teamValue);
        else if (genderValue === "Female" && teamValue.endsWith("Boys"))
            setTeamError("Sairam! Female student cannot participate in "+teamValue);
        else
            setTeamError("");
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

    async function handleSelectGrpEvent(eventName) {
        try {
            setSelectedGrpEvent(eventName);
            setGrpEventLoading(true);
            setSelectedStudents([]);
            setTeamName("");
            setEditingTeamId(null);
            setGrpEventStudents([]);
            setEventTeams([]);

            let q;
            if (eventName.startsWith("Altar") || eventName.startsWith("Rudram")){
                q = query(
                    collection(db, "studentDetails"),
                    where("groupEvent", "==", eventName),
                    where("samithi","==",samithiMap[email])
                );
            }
            else{
                q = query(
                    collection(db, "studentDetails"),
                    where("teamEvent", "==", eventName),
                    where("samithi","==",samithiMap[email])
                );
            }
            
            const querySnapshot = await getDocs(q);
            const students = querySnapshot.docs.map((document) => ({
                docId: document.id,
                ...document.data()
            }));
            setGrpEventStudents(students);
            const teamsForEvent = await fetchEventTeams(eventName);
            setTeamName(
                teamsForEvent.length >= MAX_TEAMS_PER_EVENT
                    ? ""
                    : teamsForEvent.length === 0 ? `${samithiMap[email]}: Team A` : `${samithiMap[email]}: Team B`
            );
        }
        catch(error) {
            console.log(error);
            alert("Unable to fetch group event participants");
        }
        finally {
            setGrpEventLoading(false);
        }
    }

    async function fetchEventTeams(eventName){
        try {
            setTeamsLoading(true);
            const teamQuery = query(
                collection(db, "groupEventTeams"),
                where("eventName", "==", eventName),
                where("samithi","==",samithiMap[email])
            );
            const teamSnapshot = await getDocs(teamQuery);
            const teams = teamSnapshot.docs.map((document) => ({
                id: document.id,
                ...document.data()
            }));
            // Sort by team name
            teams.sort((a, b) =>
                (a.teamName || "").localeCompare(b.teamName || "")
            );
            setEventTeams(teams);
            return teams;
        }
        catch(error) {
            console.error(error);
            alert("Unable to fetch existing teams");
        }
        finally {
            setTeamsLoading(false);
        }
    }

    function handleStudentSelection(student) {
        setSelectedStudents((previousStudents) => {
            const alreadySelected = previousStudents.some(
                (selectedStudent) =>
                    selectedStudent.docId === student.docId
            );

            if (alreadySelected) {
                return previousStudents.filter(
                    (selectedStudent) =>
                        selectedStudent.docId !== student.docId
                );
            }
            if (previousStudents.length >= MAX_TEAM_SIZE_AD) {
                setErrorMsg(`A team can have a maximum of ${MAX_TEAM_SIZE_AD} students.`);
                return previousStudents;
            }

            return [
                ...previousStudents,
                student
            ];
        });
    }

    function getAssignedStudentIds() {
        const assignedIds = new Set();
        eventTeams.forEach((team) => {
            if (team.id === editingTeamId) {
                return;
            }
            if (team.memberIds) {
                team.memberIds.forEach((id) => {
                    assignedIds.add(id);
                });
            }
        });
        return assignedIds;
    }

    const assignedStudentIds = getAssignedStudentIds();

    async function handleSaveTeam() {
        if (selectedGrpEvent === "") {
            alert("Please select a group event");
            return;
        }
        if (teamName.trim() === "") {
            alert("Please enter a team name");
            return;
        }
        if (selectedStudents.length === 0) {
            alert("Please select at least one participant");
            return;
        }
        if ((selectedGrpEvent === "Altar Decoration - Boys" || selectedGrpEvent === "Altar Decoration - Girls") && selectedStudents.length < MIN_TEAM_SIZE_AD) {
            setErrorMsg(`A team must have at least ${MIN_TEAM_SIZE_AD} students.`);
            return;
        }
        if ((selectedGrpEvent === "Altar Decoration - Boys" || selectedGrpEvent === "Altar Decoration - Girls") && selectedStudents.length > MAX_TEAM_SIZE_AD) {
            setErrorMsg(`A team cannot have more than ${MAX_TEAM_SIZE_AD} students.`);
            return;
        }
        if ((selectedGrpEvent === "Rudram Namakam Chanting - Boys" || selectedGrpEvent === "Rudram Namakam Chanting - Girls") && selectedStudents.length < MIN_TEAM_SIZE_NC) {
            setErrorMsg(`A team must have at least ${MIN_TEAM_SIZE_NC} students.`);
            return;
        }
        if ((selectedGrpEvent === "Rudram Namakam Chanting - Boys" || selectedGrpEvent === "Rudram Namakam Chanting - Girls") && selectedStudents.length > MAX_TEAM_SIZE_NC) {
            setErrorMsg(`A team cannot have more than ${MAX_TEAM_SIZE_NC} students.`);
            return;
        }
        if ((selectedGrpEvent === "Dumb Charades" || selectedGrpEvent === "Wealth out of Waste" || selectedGrpEvent === "Rangoli" || selectedGrpEvent === "Quiz") && selectedStudents.length !== 2) {
            setErrorMsg(`A team must have exactly 2 students.`);
            return;
        }
        if ((selectedGrpEvent === "Dumb Charades" || selectedGrpEvent === "Wealth out of Waste" || selectedGrpEvent === "Rangoli" || selectedGrpEvent === "Quiz")){
            const genders = new Set(selectedStudents.map(student => student.gender));
            if (genders.size !== 1) {
                setErrorMsg("A team can have only boys or only girls.");
                return;
            }
        }
        if (!editingTeamId) {
            const teamsForSelectedEvent = eventTeams.filter(
                (team) => team.eventName === selectedGrpEvent
            );
            if (teamsForSelectedEvent.length >= MAX_TEAMS_PER_EVENT) {
                setErrorMsg(`This event already has the maximum of ${MAX_TEAMS_PER_EVENT} teams.`);
                return;
            }
        }

        try {
            setSavingTeam(true);
            const members = selectedStudents.map((student) => ({
                studentId: student.docId,
                name: student.name || "",
                gender: student.gender || "",
                dob: student.dob || "",
                group: student.group || ""
            }));

            const memberIds = selectedStudents.map(
                (student) => student.docId
            );
            const teamData = {
                eventName: selectedGrpEvent,
                teamName: teamName.trim(),
                samithi: selectedStudents[0]?.samithi || "",
                members,
                memberIds,
                updatedAt: serverTimestamp()
            };

            // EDIT EXISTING TEAM
            if (editingTeamId) {
                await updateDoc(
                    doc(db, "groupEventTeams", editingTeamId),
                    teamData
                );
                alert("Team updated successfully");
            }
            // CREATE NEW TEAM
            else {
                await addDoc(
                    collection(db, "groupEventTeams"),
                    {
                        ...teamData,
                        createdAt: serverTimestamp()
                    }
                );
                alert("Team created successfully");
                setManageGrpEvent(false);
            }
            // Reset form
            setSelectedStudents([]);
            setTeamName("");
            setEditingTeamId(null);
            // Refresh team list
            await fetchEventTeams(selectedGrpEvent);
            await handleSelectGrpEvent(selectedGrpEvent);
        }
        catch(error) {
            console.error(error);
            alert("Unable to save team");
        }
        finally {
            setSavingTeam(false);
        }
    }

    function handleEditTeam(team) {
        setEditingTeamId(team.id);
        setTeamName(team.teamName || "");
        const teamStudents = grpEventStudents.filter((student) =>
            team.memberIds?.includes(student.docId)
        );
        setSelectedStudents(teamStudents);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function handleCancelEdit() {
        setEditingTeamId(null);
        setTeamName("");
        setSelectedStudents([]);
    }

    async function handleDeleteTeam(teamId, currentTeamName) {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${currentTeamName}?`
        );
        if (!confirmed) {
            return;
        }
        try {
            await deleteDoc(
                doc(db, "groupEventTeams", teamId)
            );
            alert("Team deleted successfully");
            await fetchEventTeams(selectedGrpEvent);
            if (editingTeamId === teamId) {
                handleCancelEdit();
            }
        }
        catch(error) {
            console.error(error);
            alert("Unable to delete team");
        }
    }

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (errorDoB !== "" || errorEvent !== "" || groupError !== "" || genderError !== "" || genderError2 !== "" || grpGenderError !== "" || errorDOJ !== "" || errorGrp2Exam != "" || teamError != "") 
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
            if (teamError !== "")
                alert(teamError);
        } 
        else 
        {
            if (event1 === "Select an event" && teamEvent === "Select an event" && groupEvent === "Select an event")
            {
                alert("Sairam! Kindly select an event");
            }
            else
            {
                try
                {
                    setLoading(true);
                    if (studentDocId === null)
                    {
                        const studentRef = doc(collection(db, "studentDetails"));
                        await setDoc(studentRef, {
                            id : studentRef.id,
                            name : name,
                            dob : dob,
                            doj : doj,
                            grp2Exam : grp2Exam !== "" ? grp2Exam : "N/A",
                            gender : gender,
                            samithi : samithi,
                            group : group,
                            event1 : event1 !== "Select an event" ? event1 : "N/A",
                            event2 : event2 !== "Select an event" ? event2 : "N/A",
                            teamEvent: teamEvent !== "Select an event" ? teamEvent : "N/A",
                            groupEvent : groupEvent !== "Select an event" ? groupEvent : "N/A",
                            attendance : "A",
                            timestamp : new Date(),
                            email : email
                        });
                        alert("Sairam! Registered Successfully");
                    }
                    else
                    {
                        const studentRef = doc(db,"studentDetails",studentDocId);
                        await updateDoc(studentRef,{
                            name : name,
                            dob : dob,
                            doj : doj,
                            grp2Exam : grp2Exam,
                            gender : gender,
                            samithi : samithi,
                            group : group,
                            event1 : event1 !== "Select an event" ? event1 : "N/A",
                            event2 : event2 !== "Select an event" ? event2 : "N/A",
                            teamEvent: teamEvent !== "Select an event" ? teamEvent : "N/A",
                            groupEvent : groupEvent !== "Select an event" ? groupEvent : "N/A",
                            attendance : "A",
                            timestamp : new Date(),
                            email : email
                        });
                        alert("Sairam! Updated Successfully");
                    }
                    window.location.reload();
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

    const samithis = JSON.parse(
        process.env.NEXT_PUBLIC_DISTRICTS || "[]"
    );

    const samithiMap = {};
        samithis.forEach((samithi) => {
        const slug = samithi
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "");

        const email = `officials.${slug}@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`;

        samithiMap[email] = samithi;
    });


    useEffect(() => {
        async function fetchData(){
            closeHelper();
            setLoading(true);
            const q = query(
                collection(db,"studentDetails")
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            let filteredData;
            if (email === `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`)
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
        setStudentDocId(null);
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

    function handleUpdateDetails(docId,nameValue,grpValue,grp2ExamValue,dobValue,dojValue,genderValue,samithiValue,event1Value,event2Value,teamEventValue,grpEventValue){
        setClicked(true);
        setStudentDocId(docId);
        setName(nameValue);
        setGroup(grpValue);
        setGrp2Exam(grp2ExamValue !== "" ? grp2ExamValue : "N/A");
        setDob(dobValue);
        setDoj(dojValue);
        setGender(genderValue);
        setSamithi(samithiValue);
        setEvent1(event1Value !== "N/A" ? event1Value : "Select an event");
        setEvent2(event2Value !== "N/A" ? event2Value : "Select an event");
        setTeamEvent(teamEventValue !== "N/A" ? teamEventValue : "Select an event");
        setGroupEvent(grpEventValue !== "N/A" ? grpEventValue : "Select an event");
    }

    function handleDownload(){
        const worksheet = XLSX.utils.json_to_sheet(studentData);
        const workbook = XLSX.utils.book_new();
        let samithi = samithiMap[email];
        XLSX.utils.book_append_sheet(workbook,worksheet,"Students");
        XLSX.writeFile(workbook,samithi.toLowerCase()+".xlsx");
    }

    async function handleDeleteStudent(studentId, nameVal)
    {
        const confirmDelete = window.confirm(`Sairam! Are you sure to delete this student (${nameVal})`)
        if (!confirmDelete)
            return;
        try{
            await deleteDoc(doc(db,"studentDetails",studentId));
            alert("Deleted sucessfully");
            window.location.reload();
        }
        catch(error){
            console.error(error);
            alert("Unable to delete student");
        }
    }

    async function handleCloseRegistration(){
        const q = query(
            collection(db,"closeRegForm")
        )
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => doc.data());

        querySnapshot.forEach(async (document) => {
            const docRef = doc(db,"closeRegForm",document.id);
            await updateDoc(docRef,{
                close: !data[0].close
            });
        });

        closeHelper();
    }

    async function closeHelper(){
        const q1 = query(
            collection(db,"closeRegForm")
        )
        const querySnapshot1 = await getDocs(q1);
        const data1 = querySnapshot1.docs.map((doc) => doc.data());

        if (data1[0].close === true){
            setClose(true);
        }
        else{
            setClose(false);
        }
    }

    useEffect(() => {
        if (close){
           alert("Sairam! Registration Form closed!");
        }
    },[close]);

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
                            <div className="flex flex-col md:flex-row justify-between">
                                <div className="flex flex-col">
                                    <h1 className="font-sans font-bold text-xl px-3 pt-3 md:text-xl">Welcome, User</h1>
                                    <h1 className="font-sans text-xs md:text-xl px-3">{email}</h1>
                                </div>
                                <div className="flex flex-col lg:flex-row">
                                    <div className="flex md:flex-row justify-between md:justify-end gap-x-1 mx-1">
                                        { email === `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}` && 
                                            !close &&
                                            <button onClick={handleCloseRegistration} className="font-sans font-semibold text-sm md:text-lg h-10 lg:h-15 rounded-lg bg-blue-100 px-2 md:rounded-xl mt-2 md:h-10 hover:bg-blue-500 hover:text-white hover:cursor-pointer transition duration-300 ease-in-out">Close Registration</button>}
                                        { email === `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}` && 
                                            close &&
                                            <button onClick={handleCloseRegistration} className="font-sans font-semibold text-sm md:text-lg h-10 lg:h-15 rounded-lg bg-blue-100 px-2 md:rounded-xl mt-2 md:h-10 hover:bg-blue-500 hover:text-white hover:cursor-pointer transition duration-300 ease-in-out">Open Registration</button>
                                        }
                                        {
                                        (close && email !== `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`) ?
                                            <button onClick={handleAddStudent} disabled className="font-sans font-semibold w-40 md:w-51 lg:h-15 text-sm md:text-lg rounded-lg bg-gray-300 md:rounded-xl mt-2 h-7 md:h-10 hover:cursor-not-allowed transition duration-300 ease-in-out">Add Student</button>
                                        :
                                            <button onClick={handleAddStudent} className="font-sans font-semibold w-40 md:w-51 lg:w-40 lg:h-15 text-sm md:text-lg rounded-lg bg-yellow-100 md:rounded-xl mt-2 h-7 md:h-10 hover:bg-yellow-500 hover:cursor-pointer transition duration-300 ease-in-out">Add Student</button>
                                        }
                                        <button onClick={handleDownload} className="font-sans font-semibold w-30 text-sm md:text-lg rounded-lg lg:h-15 bg-fuchsia-200 md:rounded-xl mt-2 h-7 md:h-10 hover:bg-fuchsia-500 hover:cursor-pointer transition duration-300 ease-in-out">Download</button>
                                    </div>
                                    <div className="flex flex md:flex-row justify-between md:justify-end gap-x-2 mx-1">
                                        {!close && <button onClick={() => setManageGrpEvent(true)} className="font-sans font-semibold text-sm md:text-lg rounded-lg lg:h-15 bg-green-200 px-2 md:rounded-xl mt-2 h-7 md:h-10 hover:bg-green-500 hover:cursor-pointer transition duration-300 ease-in-out">Manage Group Events</button>}
                                        <button onClick={handleLogout} className="font-sans font-semibold w-29 text-sm md:text-lg rounded-lg lg:h-15 bg-red-200 px-2 md:rounded-xl mt-2 h-7 md:h-10 hover:bg-red-500 hover:cursor-pointer hover:text-white transition duration-300 ease-in-out">Logout</button>
                                    </div>
                                </div>
                            </div>
                        </nav>

                        <div className="mx-auto bg-white rounded-xl shadow-lg mt-5 p-4 w-75 md:w-180 lg:w-250">
                            <h1 className="flex justify-center font-sans text-center font-bold text-lg md:text-2xl">Details of Registered Students</h1>
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
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Team Event</th>
                                            <th className="font-sans p-2 font-semibold border border-gray-400">Group Event</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            studentData.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-200 transition duration-300 ease-in-out">
                                                    <td className="font-sans text-lg p-2 border border-black">
                                                        <div className="flex flex-row">
                                                            <FaEdit onClick={() => handleUpdateDetails(student.id,student.name,student.group,student.grp2Exam,student.dob,student.doj,student.gender,student.samithi,student.event1,student.event2,student.teamEvent,student.groupEvent)} className="mx-auto text-blue-800 text-3xl hover:cursor-pointer"/>
                                                            <MdDelete className="mx-auto hover:cursor-pointer text-red-500 text-3xl" onClick={() => handleDeleteStudent(student.id,student.name)} />
                                                        </div>
                                                    </td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.name}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.group}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.grp2Exam}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.dob}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.doj}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.gender}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.samithi}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.event1}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.event2}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.teamEvent}</td>
                                                    <td className="font-sans text-lg p-2 border border-black">{student.groupEvent}</td>
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
                                    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossOrigin="anonymous"></link>
                                    <button onClick={handleFormClose} type="button" className="select-none p-2 rounded-3xl hover:cursor-pointer hover:text-white close transition duration-300 ease-in-out" aria-label="Close">
                                        <span aria-hidden="true">❌</span>
                                    </button>
                                </div>

                                <div className="flex justify-center font-sans font-bold text-xl md:text-3xl mt-3">
                                    DLBTS Registration Form
                                </div>

                                <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 bg-gray-100">
                                    <div className="p-4 mt-8 font-sans font-bold text-xl">
                                        NOTE:
                                    </div>
                                    <div className="flex flex-col px-4 pb-4 text-xl">
                                        <h1>A child can participate in:</h1>
                                        <h1>&nbsp;&nbsp;&nbsp;&nbsp;1. two individual events and one group event OR</h1>
                                        <h1>&nbsp;&nbsp;&nbsp;&nbsp;2. one individual event and one team event and one group event OR</h1>
                                        <h1>&nbsp;&nbsp;&nbsp;&nbsp;3. two individual events and one team event.</h1>
                                    </div>
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
                                            (email === `admin@dlbts.${process.env.NEXT_PUBLIC_DISTRICT_CODE}`) ? 
                                                <select value={samithi} onChange={(e) => {setSamithi(e.target.value)}} name="samithi" required className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                    <option value="">Select a Samithi</option>
                                                    {samithis.map((district) => (
                                                        <option key={district} value={district}>
                                                        {district}
                                                        </option>
                                                    ))}
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
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2,teamEvent);handleGroupChange(e.target.value,event2,teamEvent,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Sloka Chanting</option>
                                                <option>Veda Chanting</option>
                                                <option>Tamizh Chants</option>
                                                <option>Story Telling (English/Tamil/Bilingual)</option>
                                                <option>Fancy Dress</option>
                                                <option>Bhajan Singing</option>
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
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2,teamEvent);handleGender1(gender,e.target.value);handleGroupChange(e.target.value,event2,teamEvent,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Sloka Chanting - Boys</option>
                                                <option>Sloka Chanting - Girls</option>
                                                <option>Veda Chanting - Boys</option>
                                                <option>Veda Chanting - Girls</option>
                                                <option>Tamizh chants - Boys</option>
                                                <option>Tamizh chants - Girls</option>
                                                <option>Just a Minute - English</option>
                                                <option>Just a Minute - Tamil</option>
                                                <option>Drawing</option>
                                                <option>Bhajan Singing - Boys</option>
                                                <option>Bhajan Singing - Girls</option>
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
                                            <select value={event1} onChange={(e) => {setEvent1(e.target.value);handleEvent2Change(e.target.value,event2,teamEvent);handleGender1(gender,e.target.value);handleGroupChange(e.target.value,event2,teamEvent,groupEvent)}} name="event1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Sloka Chanting - Boys</option>
                                                <option>Sloka Chanting - Girls</option>
                                                <option>Veda Chanting - Boys</option>
                                                <option>Veda Chanting - Girls</option>
                                                <option>Tamizh chants - Boys</option>
                                                <option>Tamizh chants - Girls</option>
                                                <option>Ted Sai - English</option>
                                                <option>Ted Sai - Tamil</option>
                                                <option>Drawing</option>
                                                <option>Bhajan Singing - Boys</option>
                                                <option>Bhajan Singing - Girls</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{genderError}</label>
                                        </div>
                                    </div>
                                : 
                                    <></>
                                }

                                { (group === "Group 1") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 lg:h-35 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the 2nd event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(event1,e.target.value,teamEvent);handleGender2(gender,e.target.value);handleGroupChange(event1,e.target.value,teamEvent,groupEvent)}} name="event2" className="p-3 mb-4 mx-2 font-sans text-lg w-68 md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Sloka Chanting</option>
                                                <option>Veda Chanting</option>
                                                <option>Tamizh Chants</option>
                                                <option>Story Telling (English/Tamil/Bilingual)</option>
                                                <option>Fancy Dress</option>
                                                <option>Bhajan Singing</option>
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
                                            <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(event1,e.target.value,teamEvent);handleGender2(gender,e.target.value);handleGroupChange(event1,e.target.value,teamEvent,groupEvent)}} name="event2" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                 <option>Sloka Chanting - Boys</option>
                                                <option>Sloka Chanting - Girls</option>
                                                <option>Veda Chanting - Boys</option>
                                                <option>Veda Chanting - Girls</option>
                                                <option>Tamizh chants - Boys</option>
                                                <option>Tamizh chants - Girls</option>
                                                <option>Just a Minute - English</option>
                                                <option>Just a Minute - Tamil</option>
                                                <option>Drawing</option>
                                                <option>Bhajan Singing - Boys</option>
                                                <option>Bhajan Singing - Girls</option>
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
                                            <select value={event2} onChange={(e) => {setEvent2(e.target.value);handleEvent2Change(event1,e.target.value,teamEvent);handleGender2(gender,e.target.value);handleGroupChange(event1,e.target.value,teamEvent,groupEvent)}} name="event2" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Sloka Chanting - Boys</option>
                                                <option>Sloka Chanting - Girls</option>
                                                <option>Veda Chanting - Boys</option>
                                                <option>Veda Chanting - Girls</option>
                                                <option>Tamizh chants - Boys</option>
                                                <option>Tamizh chants - Girls</option>
                                                <option>Ted Sai - English</option>
                                                <option>Ted Sai - Tamil</option>
                                                <option>Drawing</option>
                                                <option>Bhajan Singing - Boys</option>
                                                <option>Bhajan Singing - Girls</option>
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
                                            Pick to register for the TEAM event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={teamEvent} onChange={(e) => {setTeamEvent(e.target.value);handleEvent2Change(event1,event2,e.target.value);handleGroupChange(event1,event2,e.target.value,groupEvent);handleTeamGender(gender,e.target.value)}} name="teamEvent1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Wealth out of Waste</option>
                                                <option>Quiz</option>
                                                <option>Rangoli</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{teamError}</label>
                                        </div>
                                    </div>
                                : (group === "Group 2") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 pb-4 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the TEAM event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={teamEvent} onChange={(e) => {setTeamEvent(e.target.value);handleEvent2Change(event1,event2,e.target.value);handleGroupChange(event1,event2,e.target.value,groupEvent);handleTeamGender(gender,e.target.value)}} name="teamEvent1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Dumb Charades</option>
                                                <option>Wealth out of Waste</option>
                                                <option>Quiz</option>
                                                <option>Rangoli</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{teamError}</label>
                                        </div>
                                    </div>
                                : (group === "Group 3") ?
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl pb-4 lg:w-220 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the TEAM event (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={teamEvent} onChange={(e) => {setTeamEvent(e.target.value);handleEvent2Change(event1,event2,e.target.value);handleGroupChange(event1,event2,e.target.value,groupEvent);handleTeamGender(gender,e.target.value)}} name="teamEvent1" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Wealth out of Waste</option>
                                                <option>Quiz</option>
                                                <option>Rangoli</option>
                                            </select>
                                            <label className="flex justify-center font-sans text-red-500 ml-2 lg:ml-4">{teamError}</label>
                                        </div>
                                    </div>
                                : <></>
                                }

                                {(group === "Group 1") ? 
                                    <div className="mx-auto mt-8 rounded-2xl shadow-2xl lg:w-220 pb-4 bg-gray-100">
                                        <div className="p-4 font-sans text-xl">
                                            Pick to register for the GROUP events (OPTIONAL)
                                        </div>
                                        <div>
                                            <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(event1,event2,teamEvent,e.target.value);handleGrpGender(gender,e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Altar Decoration - Boys</option>
                                                <option>Altar Decoration - Girls</option>                                                
                                                <option>Rudram Namakam Chanting - Boys</option>
                                                <option>Rudram Namakam Chanting - Girls</option>
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
                                            <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(event1,event2,teamEvent,e.target.value);handleGrpGender(gender,e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Altar Decoration - Boys</option>
                                                <option>Altar Decoration - Girls</option>                                                
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
                                            <select value={groupEvent} onChange={(e) => {setGroupEvent(e.target.value);handleGroupChange(event1,event2,teamEvent,e.target.value);handleGrpGender(gender,e.target.value)}} name="groupEvent" className="p-3 mb-4 mx-2 font-sans w-68 text-lg md:w-180 lg:mx-4 lg:mb-0 lg:w-210 rounded-xl border">
                                                <option value="Select an event">Select an event</option>
                                                <option>Altar Decoration - Boys</option>
                                                <option>Altar Decoration - Girls</option>                                                
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

                {manageGrpEvent && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
                        <div className="relative mx-auto my-6 w-75 md:w-180 lg:w-250 rounded-2xl bg-white shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <div>
                                    <h1 className="text-lg text-center md:text-2xl md:text-3xl font-bold">Manage Group & Team Events</h1>
                                </div>
                                <button onClick={() => {setManageGrpEvent(false);setSelectedGrpEvent("");setGrpEventStudents([]);}}className="rounded-lg px-4 py-2 font-semibold hover:cursor-pointer">❌</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => handleSelectGrpEvent("Altar Decoration - Boys")} 
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Altar Decoration - Boys"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Altar Decoration - Boys
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Altar Decoration - Girls")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Altar Decoration - Girls"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Altar Decoration - Girls
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Rudram Namakam Chanting - Boys")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Rudram Namakam Chanting - Boys"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Rudram Namakam Chanting - Boys
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Rudram Namakam Chanting - Girls")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Rudram Namakam Chanting - Girls"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Rudram Namakam Chanting - Girls
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Dumb Charades")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Dumb Charades"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Dumb Charades
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Wealth out of Waste")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Wealth out of Waste"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Wealth out of Waste
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Rangoli")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Rangoli"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Rangoli
                                </button>
                                <button
                                    onClick={() =>
                                        handleSelectGrpEvent("Quiz")
                                    }
                                    className={`rounded-xl p-5 md:text-lg font-semibold shadow transition
                                    ${
                                        selectedGrpEvent === "Quiz"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 hover:bg-green-100"
                                    }`}
                                >
                                    Quiz
                                </button>
                            </div>
                                {selectedGrpEvent !== "" && (
                                    <div className="mt-8">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-5">
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-bold">{selectedGrpEvent}</h2>
                                                <p className="text-gray-500 mt-1">Select participants and create teams</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="rounded-lg bg-blue-100 px-4 py-2 font-semibold">
                                                    Participants:
                                                    {" "}
                                                    {grpEventStudents.length}
                                                </div>
                                                <div className="rounded-lg bg-green-100 px-4 py-2 font-semibold">
                                                    Selected:
                                                    {" "}
                                                    {selectedStudents.length}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border bg-gray-50 p-5 mb-8">
                                            <h3 className="text-lg font-bold mb-4">
                                                {editingTeamId
                                                    ? "Edit Team"
                                                    : "Create New Team"
                                                }
                                            </h3>
                                            {eventTeams.length >= MAX_TEAMS_PER_EVENT && !editingTeamId ? (
                                                <div className="rounded-lg bg-orange-100 p-4 font-semibold text-orange-700">
                                                    This event already has the maximum of {MAX_TEAMS_PER_EVENT} teams.
                                                    Edit or delete an existing team to make changes.
                                                </div>
                                            ) : (
                                            <div className="flex flex-col md:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    value={teamName}
                                                    readOnly
                                                    className="flex-1 rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
                                                />
                                                <button
                                                    onClick={handleSaveTeam}
                                                    disabled={savingTeam}
                                                    className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {savingTeam
                                                        ? "Saving..."
                                                        : editingTeamId
                                                            ? "Update Team"
                                                            : "Create Team"
                                                    }
                                                </button>
                                                {editingTeamId && (
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="rounded-lg bg-gray-300 px-6 py-3 font-semibold hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                            )}
                                            {errorMsg && <p className="text-red-500 mt-3">{errorMsg}</p>}
                                            <p className="text-sm text-gray-500 mt-3">
                                                Select the participants below, enter a team name,
                                                and click Create Team.
                                            </p>
                                        </div>
                                        {grpEventLoading ? (
                                            <div className="text-center py-10 text-xl">
                                                Loading participants...
                                            </div>
                                        ) : grpEventStudents.length === 0 ? (
                                            <div className="rounded-xl bg-gray-100 text-center p-8 text-lg">
                                                No participants registered for this event.
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-xl border">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-200">
                                                            <th className="border p-3 text-center">
                                                                Select
                                                            </th>
                                                            <th className="border p-3 text-left">
                                                                S. No.
                                                            </th>
                                                            <th className="border p-3 text-left">
                                                                Name
                                                            </th>
                                                            <th className="border p-3 text-left">
                                                                Group
                                                            </th>
                                                            <th className="border p-3 text-left">
                                                                Gender
                                                            </th>
                                                            <th className="border p-3 text-left">
                                                                Samithi
                                                            </th>
                                                            <th className="border p-3 text-center">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {grpEventStudents.map(
                                                            (student, index) => {
                                                                const isSelected =
                                                                    selectedStudents.some(
                                                                        (selectedStudent) =>
                                                                            selectedStudent.docId ===
                                                                            student.docId
                                                                    );
                                                                const isAssigned =
                                                                    assignedStudentIds.has(
                                                                        student.docId
                                                                    );
                                                                return (
                                                                    <tr
                                                                        key={student.docId}
                                                                        className={
                                                                            isSelected
                                                                                ? "bg-green-50"
                                                                                : "hover:bg-gray-50"
                                                                        }
                                                                    >
                                                                        <td className="border p-3 text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                disabled={
                                                                                    isAssigned ||
                                                                                    (!isSelected && selectedStudents.length >= MAX_TEAM_SIZE_AD)
                                                                                }
                                                                                onChange={() =>
                                                                                    handleStudentSelection(
                                                                                        student
                                                                                    )
                                                                                }
                                                                                className="h-5 w-5 cursor-pointer"
                                                                            />
                                                                        </td>
                                                                        <td className="border p-3">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td className="border p-3 font-medium">
                                                                            {student.name}
                                                                        </td>
                                                                        <td className="border p-3">
                                                                            {student.group}
                                                                        </td>
                                                                        <td className="border p-3">
                                                                            {student.gender}
                                                                        </td>
                                                                        <td className="border p-3">
                                                                            {student.samithi}
                                                                        </td>
                                                                        <td className="border p-3 text-center">
                                                                            {isAssigned ? (
                                                                                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                                                                                    Already Assigned
                                                                                </span>
                                                                            ) : isSelected ? (
                                                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                                                                    Selected
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400">
                                                                                    Available
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="mt-10">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl md:text-2xl font-bold">
                                                    Created Teams
                                                </h2>
                                                <span className="rounded-lg bg-purple-100 px-4 py-2 font-semibold">
                                                    Teams:
                                                    {" "}
                                                    {eventTeams.length}
                                                </span>
                                            </div>
                                            {teamsLoading ? (
                                                <div className="text-center py-6">
                                                    Loading teams...
                                                </div>
                                            ) : eventTeams.length === 0 ? (
                                                <div className="rounded-xl bg-gray-100 p-8 text-center">
                                                    No teams created yet.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    {eventTeams.map((team) => (
                                                        <div
                                                            key={team.id}
                                                            className="rounded-2xl border bg-white shadow-sm overflow-hidden"
                                                        >
                                                            <div className="flex justify-between items-center bg-gray-100 p-4">
                                                                <div>
                                                                    <h3 className="text-lg font-bold">
                                                                        {team.teamName}
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        {team.members?.length || 0}
                                                                        {" "}
                                                                        Members
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleEditTeam(team)
                                                                        }
                                                                        className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteTeam(
                                                                                team.id,
                                                                                team.teamName
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="p-4">
                                                                <div className="space-y-2">
                                                                    {team.members?.map(
                                                                        (member, index) => (
                                                                            <div
                                                                                key={member.studentId}
                                                                                className="flex justify-between items-center rounded-lg bg-gray-50 px-3 py-2"
                                                                            >
                                                                                <div>
                                                                                    <span className="font-semibold">
                                                                                        {index + 1}.
                                                                                        {" "}
                                                                                        {member.name}
                                                                                    </span>
                                                                                    <div className="text-sm text-gray-500">
                                                                                        {member.samithi}
                                                                                        {" · "}
                                                                                        {member.group}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                )}

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