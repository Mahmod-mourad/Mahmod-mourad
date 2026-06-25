import { useAnalytics } from '../hooks/useAnalytics';

export function AnalyticsDashboard() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) return <div className="p-6 text-gray-500 animate-pulse">Loading Analytics...</div>;
  if (error || !data) return <div className="p-6 text-red-500">Failed to load analytics.</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📈</span> Response-Rate Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col justify-center items-center">
          <span className="text-indigo-800 text-sm font-bold uppercase tracking-wider mb-2">Overall Interview Rate</span>
          <span className="text-4xl font-extrabold text-indigo-600">{data.overallConversionRate}%</span>
        </div>
        
        {/* Placeholder for future top stats */}
        <div className="bg-gray-50 border rounded-xl p-6 flex flex-col justify-center items-center">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Top CV Version</span>
          <span className="text-xl font-bold text-gray-800 text-center">
            {data.byCvVersion.length > 0 ? data.byCvVersion[0].category : 'N/A'}
          </span>
        </div>

        <div className="bg-gray-50 border rounded-xl p-6 flex flex-col justify-center items-center">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Top Source</span>
          <span className="text-xl font-bold text-gray-800 text-center">
            {data.bySource.length > 0 ? data.bySource[0].category : 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">By CV Version</h3>
          {data.byCvVersion.length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <div className="space-y-4">
              {data.byCvVersion.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-500">{item.interviews} / {item.totalApplications} ({item.conversionRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(item.conversionRate, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">By Source</h3>
          {data.bySource.length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <div className="space-y-4">
              {data.bySource.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-500">{item.interviews} / {item.totalApplications} ({item.conversionRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(item.conversionRate, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
