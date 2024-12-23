import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { getToken } from '@/lib/auth';
import { AddGradeDialog } from './AddGradeDialog';

interface Grade {
    id: number;
    subject: string;
    score: number;
    student_id: number;
}

export function StudentGrades() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [error, setError] = useState('');
    const [studentName, setStudentName] = useState('');

    const fetchGrades = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}/grades`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (!response.ok) {
                console.error('Failed to fetch grades:', await response.text());
                throw new Error('Failed to fetch grades');
            }
            const data = await response.json();
            console.log('Fetched grades:', data);
            setGrades(data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError('Failed to load grades');
        }
    };

    const fetchStudentName = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}/`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch student');
            const data = await response.json();
            setStudentName(data.name);
        } catch (err) {
            setError('Failed to load student information');
        }
    };

    useEffect(() => {
        fetchStudentName();
        fetchGrades();
    }, [studentId]);

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" onClick={() => navigate('/students')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-2xl font-bold">
                            {studentName}'s Grades
                        </CardTitle>
                    </div>
                    <AddGradeDialog studentId={Number(studentId)} onGradeAdded={fetchGrades} />
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grades.map((grade) => (
                                <TableRow key={grade.id}>
                                    <TableCell>{grade.subject}</TableCell>
                                    <TableCell>{grade.score}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
