import { RowDataPacket } from 'mysql2/promise'; // Import necessary type from mysql2
import { Request, Response } from "express";
import pool from "../config/db";
import { Task } from "../models/task.mode";

interface RequestWithParams extends Request {
    params: {
        id: string
    }
}

export const getTasks = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.json(rows);
    } catch(error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getTaskById = async (req: Request<{ id: string}>, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        const [rows] = await pool.query<Task[] & RowDataPacket[]>('SELECT * FROM tasks WHERE id = ?', [id]);
        if (Array.isArray(rows) && rows.length === 0) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json(rows[0]);
    } catch(error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, completed } = req.body as Task;
        const [result] = await pool.query('INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)',
            [title,
            description,
            completed || false
        ]);
        res.status(201).json({ id: (result as any).insertId, title, description, completed});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const updateTask = async (req: Request<{id: string}>, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const { title, description, completed } = req.body as Task;

        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }
        
        await pool.query('UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?', [
            title,
            description,
            completed,
            id
        ]);
        res.status(200).json({ message: 'Task updated successfully' });
    } catch(error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const deleteTask = async (req: Request<{id: string}>, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid task ID' });
            return;
        }

        await pool.query('DELETE FROM tasks WHERE id = ?', [
            id
        ]);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch(error) {
        res.status(500).json({ message: 'Server error', error });
    }
}