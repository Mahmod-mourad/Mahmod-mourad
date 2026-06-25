import { useState, useRef, useEffect } from 'react';
import { useSimulateNegotiation } from '../hooks/useNegotiation';
import type { NegotiationTurn } from '@nexahire/types';

export function NegotiationSimulator() {
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [role, setRole] = useState('Senior Engineer');
  const [targetSalary, setTargetSalary] = useState(85000);
  const [initialOffer, setInitialOffer] = useState(70000);
  
  const [history, setHistory] = useState<NegotiationTurn[]>([]);
  const [input, setInput] = useState('');
  const [coachingNote, setCoachingNote] = useState<string | null>(null);

  const { mutate: simulate, isPending } = useSimulateNegotiation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newHistory: NegotiationTurn[] = [...history, { role: 'user', message: input }];
    setHistory(newHistory);
    setInput('');
    setCoachingNote(null);

    simulate({
      companyName,
      role,
      userTargetSalary: targetSalary,
      recruiterInitialOffer: initialOffer,
      history: newHistory,
    }, {
      onSuccess: (data) => {
        setHistory(prev => [...prev, { role: 'recruiter', message: data.recruiterMessage }]);
        setCoachingNote(data.coachingNote);
      },
      onError: () => {
        alert('Failed to simulate turn.');
        setHistory(prev => prev.slice(0, -1)); // Revert
      }
    });
  };

  const startSimulation = () => {
    setHistory([{ role: 'recruiter', message: `Hi there! We are thrilled to offer you the ${role} position at ${companyName}. The offer is €${initialOffer} per year. What do you think?` }]);
    setCoachingNote("The recruiter has made the first offer. It's lower than your target. Acknowledge the offer gracefully and pivot to value before countering.");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[700px]">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <span>🤝</span> Negotiation Simulator
        </h2>
        {history.length === 0 && (
          <button onClick={startSimulation} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Start Drill
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-md space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Setup Scenario</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Company" value={companyName} onChange={e => setCompanyName(e.target.value)} className="p-2 border rounded w-full" />
              <input type="text" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} className="p-2 border rounded w-full" />
              <div>
                <label className="text-xs text-gray-500 block text-left mb-1">Target Salary</label>
                <input type="number" value={targetSalary} onChange={e => setTargetSalary(Number(e.target.value))} className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block text-left mb-1">Initial Offer</label>
                <input type="number" value={initialOffer} onChange={e => setInitialOffer(Number(e.target.value))} className="p-2 border rounded w-full" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">The AI will play the recruiter and give you live coaching on your responses.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {history.map((turn, i) => (
            <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-4 rounded-xl shadow-sm ${turn.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none text-gray-800'}`}>
                <div className="text-xs font-bold mb-1 opacity-75">{turn.role === 'user' ? 'You' : 'Recruiter'}</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.message}</p>
              </div>
            </div>
          ))}
          {isPending && (
            <div className="flex justify-start">
              <div className="bg-white border p-4 rounded-xl rounded-bl-none shadow-sm text-gray-400 italic text-sm">
                Recruiter is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {coachingNote && (
        <div className="p-4 bg-amber-50 border-t border-amber-200">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span>💡</span> Coaching Note
          </h4>
          <p className="text-sm text-amber-900">{coachingNote}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-4 border-t bg-white flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your response... (Press Enter to send)"
            className="flex-1 border rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 text-sm"
            rows={2}
            disabled={isPending}
          />
          <button 
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex-shrink-0"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
