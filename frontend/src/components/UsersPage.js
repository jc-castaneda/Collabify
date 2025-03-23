import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UsersPage() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/users/")
            .then((response) => response.json())
            .then((data) => setUsers(data.users))
            .catch((error) => console.error("Error fetching users:", error));
    }, []);

    return (
        <div>
            <h1>Members</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <Link to={`/users/details/${user.id}`}>{user.username}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UsersPage;
