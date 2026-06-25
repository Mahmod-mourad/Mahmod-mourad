import { useState } from 'react';
import { useNetPay } from '../hooks/useNegotiation';

export function NetPayCalculator() {
  const [gross, setGross] = useState('60000');
  const [country, setCountry] = useState<'NL' | 'DE' | 'GULF'>('DE');
  const [ruling, setRuling] = useState(false);

  const { data, isLoading } = useNetPay(gross, country, ruling);

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>💰</span> Quick Net-Pay Calculator
      </h3>
      <p className="text-sm text-gray-500 mb-6">Compare approximate post-tax take-home pay.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gross Annual (€)</label>
          <input
            type="number"
            value={gross}
            onChange={(e) => setGross(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as 'NL' | 'DE' | 'GULF')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="DE">Germany (DE)</option>
            <option value="NL">Netherlands (NL)</option>
            <option value="GULF">Gulf / UAE</option>
          </select>
        </div>
        {country === 'NL' && (
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={ruling}
                onChange={(e) => setRuling(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Apply 30% Ruling
            </label>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border">
        <span className="text-gray-600 font-medium">Estimated Net Pay:</span>
        {isLoading ? (
          <span className="text-gray-400">Calculating...</span>
        ) : (
          <span className="text-2xl font-bold text-green-600">
            €{data?.net ? Math.round(data.net).toLocaleString() : '0'} <span className="text-sm text-gray-500 font-normal">/ yr</span>
          </span>
        )}
      </div>
    </div>
  );
}
