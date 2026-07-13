import { useState } from 'react';
import TicketCard from '../../components/TicketCard';
import { useMutation } from '@tanstack/react-query';

export default function LostAndFoundForm() {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        lastSeen: '',
        clothing: '',
        contact: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const reportMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch('/api/lost-found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to submit report');
            return res.json();
        },
        onSuccess: () => {
            setSubmitted(true);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        reportMutation.mutate(formData);
    };

    if (submitted) {
        return (
            <TicketCard className="text-center py-8">
                <div className="text-calmGreen text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-display text-primary mb-2">Report Sent!</h3>
                <p className="text-neutralText mb-4">Stewards have been notified and are on the lookout.</p>
                {reportMutation.data?.data?.reference && (
                    <p className="text-sm font-bold">Ref: {reportMutation.data.data.reference}</p>
                )}
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', age: '', lastSeen: '', clothing: '', contact: '' });
                    }}
                    className="mt-4 text-matchdayRed underline"
                >
                    File another report
                </button>
            </TicketCard>
        );
    }

    return (
        <TicketCard>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-urgentOrange/10 rounded-badge flex items-center justify-center text-2xl">👤</div>
                <div>
                    <h3 className="font-display text-lg text-primary">Report Lost Person</h3>
                    <p className="text-xs text-neutralText">Notify stewards immediately</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    placeholder="Name of person"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-matchdayRed"
                    required
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-matchdayRed"
                    />
                    <input
                        type="text"
                        placeholder="Last seen (Section)"
                        value={formData.lastSeen}
                        onChange={(e) => setFormData({ ...formData, lastSeen: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-matchdayRed"
                        required
                    />
                </div>
                <input
                    type="text"
                    placeholder="Clothing description"
                    value={formData.clothing}
                    onChange={(e) => setFormData({ ...formData, clothing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-matchdayRed"
                />
                <input
                    type="tel"
                    placeholder="Your contact number"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-matchdayRed"
                    required
                />
                <button
                    type="submit"
                    disabled={reportMutation.isPending}
                    className="w-full bg-urgentOrange text-white py-3 rounded-button font-bold hover:bg-urgentOrange/90 disabled:opacity-50"
                >
                    {reportMutation.isPending ? 'Sending...' : 'Send Alert'}
                </button>
            </form>
        </TicketCard>
    );
}
