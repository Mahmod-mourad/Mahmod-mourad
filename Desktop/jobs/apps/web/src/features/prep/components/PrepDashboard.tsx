import { useState, useRef, useEffect } from 'react';
import { useStarStories, useCreateStarStory, useSimulateMockInterview } from '../hooks/usePrep';
import type { NegotiationTurn } from '@nexahire/types';

export function PrepDashboard() {
  const [activeTab, setActiveTab] = useState<'mock' | 'star'>('mock');

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-8">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('mock')}
          className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'mock' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          🎤 AI Mock Interview
        </button>
        <button
          onClick={() => setActiveTab('star')}
          className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'star' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          ⭐ STAR Stories Bank
        </button>
      </div>

      <div className="p-6 h-[700px] overflow-y-auto bg-gray-50/30">
        {activeTab === 'mock' ? <MockInterview /> : <StarStories />}
      </div>
    </div>
  );
}

function MockInterview() {
  const [role, setRole] = useState('Frontend Engineer');
  const [questionType, setQuestionType] = useState<'behavioral' | 'technical' | 'system_design'>('behavioral');
  const [history, setHistory] = useState<NegotiationTurn[]>([]);
  const [input, setInput] = useState('');
  const [coachingNote, setCoachingNote] = useState<string | null>(null);

  const { mutate: simulate, isPending } = useSimulateMockInterview();
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
      role,
      questionType,
      history: newHistory,
    }, {
      onSuccess: (data) => {
        setHistory(prev => [...prev, { role: 'recruiter', message: data.interviewerMessage }]);
        setCoachingNote(data.coachingNote);
      },
      onError: () => {
        alert('Failed to simulate turn.');
        setHistory(prev => prev.slice(0, -1)); // Revert
      }
    });
  };

  const startSimulation = () => {
    // Start with empty history so AI generates the first question
    simulate({
      role,
      questionType,
      history: [],
    }, {
      onSuccess: (data) => {
        setHistory([{ role: 'recruiter', message: data.interviewerMessage }]);
        setCoachingNote(data.coachingNote || "Listen carefully and take a breath before answering.");
      }
    });
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Setup Mock Interview</h3>
        <div className="w-full space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
            <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
            <select value={questionType} onChange={e => setQuestionType(e.target.value as 'behavioral' | 'technical' | 'system_design')} className="w-full p-2 border rounded-lg bg-white">
              <option value="behavioral">Behavioral (STAR)</option>
              <option value="technical">Technical / Knowledge</option>
              <option value="system_design">System Design</option>
            </select>
          </div>
          <button 
            onClick={startSimulation}
            disabled={isPending}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            {isPending ? 'Starting...' : 'Start Interview'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {history.map((turn, i) => (
          <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-4 rounded-xl shadow-sm ${turn.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none text-gray-800'}`}>
              <div className="text-xs font-bold mb-1 opacity-75">{turn.role === 'user' ? 'You' : 'Interviewer'}</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.message}</p>
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-white border p-4 rounded-xl rounded-bl-none shadow-sm text-gray-400 italic text-sm">
              Interviewer is thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {coachingNote && (
        <div className="p-4 bg-amber-50 border-t border-amber-200">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span>💡</span> Interview Coach
          </h4>
          <p className="text-sm text-amber-900">{coachingNote}</p>
        </div>
      )}

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
          placeholder="Type your answer... (Press Enter to send)"
          className="flex-1 border rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 text-sm"
          rows={3}
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
    </div>
  );
}

function StarStories() {
  const { data: stories, isLoading } = useStarStories();
  const { mutate: createStory, isPending } = useCreateStarStory();
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');

  const handleSave = () => {
    createStory({ title, situation, task, action, result, skills: [] }, {
      onSuccess: () => {
        setShowForm(false);
        setTitle(''); setSituation(''); setTask(''); setAction(''); setResult('');
      }
    });
  };

  if (isLoading) return <div>Loading stories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Your STAR Stories</h3>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200">
          {showForm ? 'Cancel' : '+ Add Story'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <input type="text" placeholder="Story Title (e.g., Conflict with PM)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg font-medium text-lg" />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Situation</label>
            <textarea value={situation} onChange={e => setSituation(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Task</label>
            <textarea value={task} onChange={e => setTask(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Action</label>
            <textarea value={action} onChange={e => setAction(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={3} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Result</label>
            <textarea value={result} onChange={e => setResult(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={2} />
          </div>
          <button onClick={handleSave} disabled={isPending || !title} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">
            {isPending ? 'Saving...' : 'Save Story'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories?.map(story => (
          <div key={story.id} className="bg-white border rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-3">{story.title}</h4>
            <div className="space-y-2 text-sm">
              <p><strong className="text-gray-500">S:</strong> {story.situation}</p>
              <p><strong className="text-gray-500">T:</strong> {story.task}</p>
              <p><strong className="text-gray-500">A:</strong> {story.action}</p>
              <p><strong className="text-gray-500">R:</strong> {story.result}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
