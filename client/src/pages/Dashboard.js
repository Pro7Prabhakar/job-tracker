import { useEffect, useState } from 'react';
import api from '../utils/axios';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const COLORS = ["#4f46e5", "#16a34a", "#f97316", "#dc2626"];

const Dashboard = () => {
    const [data, setData] = useState({ status_summary: [], weekly_summary: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/dashboard/");
                setData(res.data);
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className='text-center mt-10 fontFamily-audiowide'>Loading Dashboard</p>

    return (
        <div className='p-6'>
            <hi className='text-2xl font-bold mb-6 text-center'>📊 Dashboard</hi>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/*Pie Chart */}
                <div className='bg-white shadow p-4 rounded-lg'>
                    <h2 className='text-lg font-semibold mb-3 text-center'>Job Status Distribution</h2>
                    <ResponsiveContainer width='100%' height={300}>
                        <PieChart>
                            <Pie
                                dataKey='count'
                                nameKey='status'
                                data={data.status_summary}
                                cx='50%'
                                cy='50%'
                                outerRadius={100}
                                label
                            >
                                {data.status_summary.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className='bg-white shadow p-4 rounded-lg'>
                    <h2 className='text-lg font-semibold mb-3 text-center'>Applications per Week</h2>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={data.weekly_summary}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='week' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='count' fill='#2563eb' name='Jobs Applied' />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
