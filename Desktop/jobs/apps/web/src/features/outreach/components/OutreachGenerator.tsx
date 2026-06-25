import { useState } from 'react';
import { useGenerateOutreach, useSnippets } from '../hooks/useOutreach';

export function OutreachGenerator() {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [targetName, setTargetName] = useState('');
  const [type, setType] = useState<'email' | 'linkedin'>('linkedin');
  const [customNote, setCustomNote] = useState('');
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>([]);
  const [draft, setDraft] = useState<string | null>(null);

  const { data: snippets } = useSnippets();
  const { mutate: generate, isPending } = useGenerateOutreach();

  const handleGenerate = () => {
    if (!companyName || !role) return alert('Company and Role are required.');
    
    generate({
      companyName,
      role,
      targetName,
      type,
      customNote,
      snippetIds: selectedSnippets,
    }, {
      onSuccess: (data) => {
        setDraft(data.content);
      },
      onError: () => {
        alert('Failed to generate outreach message.');
      }
    });
  };

  const toggleSnippet = (id: string) => {
    setSelectedSnippets(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>✉️</span> Outreach Generator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Stripe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Senior Frontend" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Name</label>
              <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value as 'email'|'linkedin')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="linkedin">LinkedIn Connection/InMail</option>
                <option value="email">Cold Email</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Snippets to Include</label>
            {snippets && snippets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {snippets.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSnippet(s.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      selectedSnippets.includes(s.id) 
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No snippets available. Manage them via API for now.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Note / Context</label>
            <textarea
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              rows={3}
              placeholder="E.g. We both went to MIT, or I saw your recent post about GraphQL..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isPending || !companyName || !role}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isPending ? 'Drafting...' : 'Generate Outreach Message'}
          </button>
        </div>

        <div className="bg-gray-50 border rounded-xl p-4 flex flex-col h-full min-h-[300px]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Generated Message</h3>
          {draft ? (
            <div className="flex-1 relative">
              <textarea
                readOnly
                value={draft}
                className="w-full h-full p-4 text-sm text-gray-800 bg-white border rounded-lg resize-none shadow-inner"
              />
              <button
                onClick={() => navigator.clipboard.writeText(draft)}
                className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded shadow-sm text-xs font-medium transition"
              >
                Copy
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400 italic">
              Fill the details and generate to see your tailored outreach message.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
