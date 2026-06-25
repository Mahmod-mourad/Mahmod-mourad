import { useState } from 'react';
import { useUpdatePortfolio } from '../hooks/usePortfolio';

export function PortfolioSettings() {
  const [slug, setSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const { mutate: update, isPending } = useUpdatePortfolio();

  const handleSave = () => {
    update({ portfolioSlug: slug, isPortfolioPublic: isPublic }, {
      onSuccess: () => alert('Portfolio settings updated!'),
      onError: (err) => alert('Failed to update portfolio: ' + err.message),
    });
  };

  const portfolioUrl = `http://localhost:3001/portfolio/${slug}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>🌐</span> Public Portfolio
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Generate a fast, server-rendered public page to share your CV and profile with recruiters.
      </p>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Slug (URL)</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              nexahire.com/
            </span>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. john-doe"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPublic ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">Make Portfolio Public</span>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || slug.length < 3}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {isPending ? 'Saving...' : 'Save Settings'}
        </button>

        {isPublic && slug.length >= 3 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-2">Your portfolio is live at:</p>
            <a href={portfolioUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono text-sm break-all">
              {portfolioUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
