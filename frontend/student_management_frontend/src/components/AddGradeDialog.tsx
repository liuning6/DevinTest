import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import { getToken } from '@/lib/auth';

interface AddGradeDialogProps {
    studentId: number;
    onGradeAdded: () => void;
}

export function AddGradeDialog({ studentId, onGradeAdded }: AddGradeDialogProps) {
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [score, setScore] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/grades/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    subject,
                    score: parseFloat(score),
                    student_id: studentId
                })
            });

            if (!response.ok) throw new Error('Failed to add grade');
            
            setOpen(false);
            setSubject('');
            setScore('');
            onGradeAdded();
        } catch (err) {
            setError('Failed to add grade');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Grade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Grade</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Input
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="number"
                            placeholder="Score"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add Grade
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
