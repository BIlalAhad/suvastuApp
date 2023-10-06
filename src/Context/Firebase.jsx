import React, { Children, useContext, useEffect, useState } from 'react'
import { doc, deleteDoc, setDoc, documentId } from "firebase/firestore";
import { createContext } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, getFirestore, getDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import jsPDF from 'jspdf'
// import UserID from 'UserID';


export const FirebaseContext = createContext(null);
export const UseFirebase = () => useContext(FirebaseContext);


const firebaseConfig = {
    apiKey: "AIzaSyBKRm9Z97Tl-rHncqlSKfvcxDy4eLsp5TU",
    authDomain: "suvastutech-1e3c4.firebaseapp.com",
    projectId: "suvastutech-1e3c4",
    storageBucket: "suvastutech-1e3c4.appspot.com",
    messagingSenderId: "720367525810",
    appId: "1:720367525810:web:55d34f5e2d9396360bceab",
    measurementId: "G-6L5LNQ79CS"
};
// let ID = (new UserID()).getID();
const firebaseapp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseapp);
const db = getFirestore(firebaseapp)
const FirebaseAuth = getAuth(firebaseapp);
const provider = new GoogleAuthProvider();
// const firestore = db;
export const FirebaseProvider = (props) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        onAuthStateChanged(FirebaseAuth, (user) => {
            if (user) {
                setUser(user);
                console.log(user.email)
            } else {
                setUser(null);
            }
        });
    }, [])
    const isLoggedIn = user ? true : false;

    const SignupUserWithEmailAndPassword = async (email, password) => {
        return createUserWithEmailAndPassword(FirebaseAuth, email, password).then(value => { alert("successfully Signup") }).catch(err => { alert("failed") });

    }
    const SignInWithGoogle = () => {
        signInWithPopup(FirebaseAuth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
            });
    }
    const SigninUserWithEmailAndPassword = (email, password) => {
        return signInWithEmailAndPassword(FirebaseAuth, email, password).then(value => { alert("successfully Login") }).catch(err => { alert("failed") });
    }
    const AddEmploy = async (employname, employemail, employrank, employimg) => {
        const imageRef = ref(storage, `${Date.now()}${employimg.name}`);
        const uploadResult = await uploadBytes(imageRef, employimg)
        const docRef = await addDoc(collection(db, "TeamMembers"), {
            employname, employemail, employrank, imageURL: uploadResult.ref.fullPath,
        });
        alert('success')
    }
    const uploadLogo=async(Logo)=>{
        const docRef = await addDoc(collection(db, "Logo"), {
            Logo
          });
    }
    const postjob = async (jobtitle, jobDescription, skills, location, salleryfrom, salleryto, jobshift, gender, country) => {
        const docRef = await addDoc(collection(db, "PostJobs"), {
            jobtitle, jobDescription, skills, location, salleryfrom, salleryto, jobshift, gender, country
        });
        alert('success');
    }
    const PostApplicent = async (name, fname, location, skills, experience, education, CNIC, phone, email, ApplyFor) => {
        const docRef = await addDoc(collection(db, "CV"), {
            name, fname, location, skills, experience, education, CNIC, phone, email, ApplyFor
        });
        alert('success');
    }
    const PostProjectTeam = async (projectname, ProjectDuration, ProjectType, Description) => {

        const docRef = await addDoc(collection(db, "Board"), {
            projectname, ProjectDuration, ProjectType, Description
        });
        const documentId = docRef.id;

        console.log("Document ID:", documentId);

        alert('success');
        await setDoc(doc(db, "Board", documentId), {
            documentId, projectname, ProjectDuration, ProjectType, Description
            
        });
        
    }
    
    // sublevel collection
   
    const posttask=async(documentId,task,description,assignTo,startingDate,dueDate)=>{
        const collectionRef= collection(db,'Board',documentId, 'todo');
        const result=await addDoc(collectionRef,{
            description,assignTo,startingDate,dueDate,task
        })
    }
       
      
    




    const listAllCV = () => {
        return getDocs(collection(db, 'CV'));
    }
    const listAllJobs = () => {
        return getDocs(collection(db, 'PostJobs'));
    }
    const listAllMembers = () => {
        return getDocs(collection(db, 'TeamMembers'));
    }
    const listProject = () => {
        return getDocs(collection(db, 'Board'));
    }
    const deleteCV = async (path) => {
        await deleteDoc(doc(db, "CV", path));
    }
    const generatePDF = (props) => {
        var doc = new jsPDF('p', 'pt');

        doc.text(20, 20, props.data().name)
        doc.addFont(props.data().fname)
        doc.text(20, 60, props.data().email)
        doc.text(20, 100, props.data().location)
        doc.text(20, 140, props.data().CNIC)
        doc.text(20, 180, props.data().education)
        doc.text(20, 220, props.data().skills)
        doc.text(20, 260, props.data().experience)
        doc.text(20, 300, props.data().phone)

        doc.save('demo.pdf')
    }
    const [CVdata, setCVData] = useState([]);
    const getsingleCV = (cv) => {
        setCVData(cv);
    }
    const [team, setTeam] = useState([])
    const putteam = (data) => {
        setTeam(...team, data);
    }
    const [singleproject, setSingleproject] = useState([]);
    const handlesingleproject = (prop) => {
        setSingleproject(props);
        console.log(singleproject)
    }
    const deleteEmploy=async(path)=>{
        await deleteDoc(doc(db, "TeamMembers", path));
    }

    const [project, setProjectData] = useState(null);

    const boardData = (docId) => {
        // const data= getDocs(collection(db, 'Board' ,docId));
        const documentRef = doc(db, 'Board', docId); // 'Board' is the collection name

        getDoc(documentRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            // Document exists, access its data
            setProjectData(docSnapshot.data());
          } else {
            console.log("Document does not exist");
          }
        })
        .catch((error) => {
          console.error("Error getting document:", error);
        });

    }

    useEffect(() => {
        console.log(singleproject)
    })




    return <FirebaseContext.Provider value={{ SignupUserWithEmailAndPassword, SignInWithGoogle, SigninUserWithEmailAndPassword, isLoggedIn,uploadLogo, AddEmploy, db, project, listAllMembers, postjob, listAllJobs, PostApplicent, listAllCV, deleteCV, generatePDF, getsingleCV, CVdata, PostProjectTeam, singleproject, putteam, listProject, singleproject, setSingleproject,boardData,posttask, deleteEmploy }}>{props.children}</FirebaseContext.Provider>
}
