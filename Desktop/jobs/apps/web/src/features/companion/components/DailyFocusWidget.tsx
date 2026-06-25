import { useDailyFocus } from '../hooks/useCompanion';

export function DailyFocusWidget() {
  const { data: focus, isLoading } = useDailyFocus();

  if (isLoading) {
    return <div className="p-4 border rounded-lg bg-gray-50 text-gray-400">Loading daily focus...</div>;
  }

  const hasTasks = focus && focus.tasks && focus.tasks.length > 0;

  return (
    <div className="p-5 border border-indigo-100 rounded-xl bg-gradient-to-br from-indigo-50 to-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
          <span>🎯</span> Daily Focus
        </h3>
        <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
          <span>🔥</span> {focus?.streak || 0} Day Streak
        </div>
      </div>

      {hasTasks ? (
        <ul className="space-y-2">
          {focus.tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-indigo-400 mt-0.5">•</span>
              {task}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500 italic">
          No tasks set for today. Stay focused on your job hunt!
        </div>
      )}
    </div>
  );
}
