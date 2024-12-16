import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { auth, firestore } from '../FirebaseConfig';

const BASE_URL = __DEV__ ? 'http://127.0.0.1:8000' : 'https://smooth-operator.web.app';
console.log('BASE_URL: ', BASE_URL, __DEV__);
const OPENAI_API_KEY = '';

globalThis.BASE_URL = BASE_URL;

declare global {
    var BASE_URL: string;
}

// export function useChatAPI_OpenAI()
// {

//     // const query
//     const [messages, setMessages] = useState([{
//         role: 'system',
//         content: `You are Smooth Operator an AI agent that helps in collection of information about the user in the home moving.
//             You collect the following information from the user and source and destination zip codes (if the user provides an area or city try to it convert to a zipcode otherwise ask them if they are able to provide zip codes for accurate quotes),
//             date of move out and move in, size of their apartment (number of bedrooms), and inventory of their furniture and other discrete items or boxes.
//             Probe the user for information till you have everything you need. Be precise and keep the conversation short and to the point.
//             If the user provides vague information about anything, try to use general estimates / averages.
//             Do not ask several questions together and engage the user in simple manner.
//             Once you have all the information you need, You will summarize all of it into a JSON format and add an estimated cubic feet to the JSON.
//             Here is an example of the JSON format:
//             {
//                 "source_zip": 33301,
//                 "destination_zip": 98409,
//                 "move_out_date": "2024-02-28",
//                 "move_in_date": "2024-03-15",
//                 "apartment_size": {
//                     "bedrooms": 1,
//                     "bathrooms": 1
//                 },
//                 "inventory": {
//                     "furniture": [
//                         "1 Bed (Frame and Mattress)",
//                         "1 Nightstand",
//                         "1 Sofa or Couch",
//                         "1 Coffee Table",
//                         "1 TV Stand"
//                     ],
//                     "appliances": [
//                         "Refrigerator",
//                         "Microwave",
//                     ],
//                     "miscellaneous": [
//                         "5 Boxes of clothing",
//                     ]
//                 },
//                 "estimated_cubic_feet": 300
//             }`
//     }]);

//     useEffect(() => {
//         if (messages[messages.length - 1].role == 'user') {
//             generateResponse();
//         }
//     }, [messages.length]);

//     useEffect(() => {
//         generateResponse();
//     }, []);

//     const addMessage = (message: string) => {
//         setMessages([...messages, { role: 'user', content: message }]);
//     }

//     const generateResponse = async () => {
//         const data = {
//             model: 'gpt-4o-mini',
//             messages,
//         };

//         const response = await axios.post(`https://api.openai.com/v1/chat/completions`, data, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${OPENAI_API_KEY}`
//             }
//         });

//         setMessages([...messages, response.data.choices[0].message]);
//     }

//     return { messages, addMessage };
// }

// axios.defaults.headers.common['Authorization'] = `Bearer ${OPENAI_API_KEY}`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export function useChatAPI()
{
    const userId = auth().currentUser?.uid;

    const mutation = useMutation({
        mutationFn: (data: any) => axios.post(`${BASE_URL}/api/chat`, data),
    });

    const [messages, setMessages] = useState([]);

    const addMessage = async (message: string) => {
        setMessages(messages => [...messages, { role: 'user', content: message }, { role: 'assistant', content: 'Thinking...' }]);
        const response = await mutation.mutateAsync({ message });
        console.log(response);
        // setMessages(messages => [...messages.slice(0, -1), { role: 'assistant', content: response.data.message }]);
    }

    const session: Session = useFirestoreDoc({
        doc: firestore().collection('users').doc(userId)
    });

    useEffect(() => {
        if (session?.messages)
            setMessages(session.messages);
    }, [session?.messages]);

    return { messages, addMessage };
}


function useFirestoreDoc<T>({ doc, enabled = true, dependencies = [] }:
    { doc:  FirebaseFirestoreTypes.DocumentReference, enabled?: boolean, dependencies?: React.DependencyList }) {
    const [value, setValue] = useState<T>(null);

    const onSnapshot = (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<T>) => {
        const data = snapshot.data();
        setValue(data ? { id: snapshot.id, ...data } : null);
    }

    useEffect(() => {
        if (!doc || !enabled)
            return;

        return doc.onSnapshot(onSnapshot);
    }, [enabled, ...dependencies]);

    return value;
}

export function useSessionAPI()
{
    const userId = auth().currentUser?.uid;

    const session: Session = useFirestoreDoc({
        doc: firestore().collection('users').doc(userId)
    });

    if (session?.customerInfo && !(session.customerInfo.move_in_date instanceof Date))
    {
        session.customerInfo.move_in_date = (session.customerInfo.move_in_date as any as FirebaseFirestoreTypes.Timestamp).toDate();
        session.customerInfo.move_out_date = (session.customerInfo.move_out_date as any as FirebaseFirestoreTypes.Timestamp).toDate();
    }

    return { session };
}