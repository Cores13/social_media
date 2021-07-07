import './Conversations.css';
import {useState, useEffect} from 'react';
import axios from 'axios';

export default function Conversations({conversation, currentUser}) {
    const [user, setUser] = useState(null);
    const PF = process.env.REACT_APP_PUBLIC_FOLDER;

    useEffect(() => {
        const friendId = conversation.members.find((m) => m !== currentUser._id);

        const getUser = async (user) => {
            try{
                const res = await axios.get('/users?userId='+friendId);
                setUser(res.data);
            }catch (error) {
                console.log(error);
            }
        };
        getUser();
    }, [currentUser, conversation]);

    return (
        <div className="conversation">
            <img className="conversationImg"  
            src={user?.profilePicture ? PF + user.profilePicture : PF + 'person/noAvatar.png'} 
            alt="" />
            <span className="conversationName">{user?.username}</span>
        </div>
    )
}