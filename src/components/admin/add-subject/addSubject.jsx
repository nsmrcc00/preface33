import React, { useState, useEffect } from 'react'
import { db } from '../../../firebase/firebase';

const addSubject = () => {
    const [newTask, setNewTask] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedId, setSelectedId] = useState('');

    // Fetch tasks on component mount
    useEffect(() => {
        const unsubscribe = db.collection('tasks').onSnapshot((snapshot) => {
            const allTasks = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(allTasks);
        });

        return unsubscribe;
    }, []);

    // Create a new task
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTask) {
            await db.collection('tasks').add({
                task: newTask,
            });
            setNewTask('');
        }
    };

    // Update a task
    const handleUpdateTask = async (id, updatedTask) => {
        await db.collection('tasks').doc(id).update({
            task: updatedTask,
        });
    };

    // Delete a task
    const handleDeleteTask = async (id) => {
        await db.collection('tasks').doc(id).delete();
    };

    return (
        <div>
            <h2>CRUD App</h2>
            <form onSubmit={handleAddTask}>
                <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add Task" />
                <button type="submit">Add</button>
            </form>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.task}
                        <button onClick={() => handleUpdateTask(task.id, prompt('Update Task:'))}>Update</button>
                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default addSubject