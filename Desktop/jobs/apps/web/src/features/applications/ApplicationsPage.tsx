import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { StatsStrip } from './components/StatsStrip';
import { DailyFocusWidget } from '../companion/components/DailyFocusWidget';
import { PushSubscriptionButton } from '../companion/components/PushSubscriptionButton';
import { OutreachGenerator } from '../outreach/components/OutreachGenerator';
import { NegotiationSimulator } from '../negotiation/components/NegotiationSimulator';
import { NetPayCalculator } from '../negotiation/components/NetPayCalculator';
import { PrepDashboard } from '../prep/components/PrepDashboard';
import { AnalyticsDashboard } from '../analytics/components/AnalyticsDashboard';
import { PortfolioSettings } from '../portfolio/components/PortfolioSettings';
import { useApplications } from './hooks/useApplications';
import { AtsOptimizer } from '../ats/AtsOptimizer';
import type { CreateApplicationDto, ApplicationStatus } from '@nexahire/types';

export function ApplicationsPage() {
  const { create } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'hunt' | 'prep' | 'analytics'>('hunt');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateApplicationDto = {
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      status: (formData.get('status') as ApplicationStatus) || 'applied',
    };
    create.mutate(dto, {
      onSuccess: () => setShowForm(false),
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Applications</h1>
          <p className="text-gray-500 mt-1">Manage your job hunt pipeline.</p>
        </div>
        <div className="flex items-center gap-4">
          <PushSubscriptionButton />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-indigo-700 hover:shadow transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {showForm ? 'Close Form' : '+ New Application'}
          </button>
        </div>
      </div>

      <div className="flex border-b mb-6">
        <button onClick={() => setActiveMainTab('hunt')} className={`px-4 py-2 font-medium transition ${activeMainTab === 'hunt' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>Hunt & Applications</button>
        <button onClick={() => setActiveMainTab('prep')} className={`px-4 py-2 font-medium transition ${activeMainTab === 'prep' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>Interview Prep</button>
        <button onClick={() => setActiveMainTab('analytics')} className={`px-4 py-2 font-medium transition ${activeMainTab === 'analytics' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>Analytics & Portfolio</button>
      </div>

      {activeMainTab === 'hunt' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-3">
              <StatsStrip />
            </div>
            <div className="md:col-span-1">
              <DailyFocusWidget />
            </div>
          </div>

          <AtsOptimizer />

          <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div>
              <OutreachGenerator />
              <NetPayCalculator />
            </div>
            <div>
              <NegotiationSimulator />
            </div>
          </div>

          <KanbanBoard />
        </>
      )}

      {activeMainTab === 'prep' && (
        <PrepDashboard />
      )}

      {activeMainTab === 'analytics' && (
        <>
          <AnalyticsDashboard />
          <PortfolioSettings />
        </>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: '24px',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '16px',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Company</label>
            <input required name="company" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Role</label>
            <input required name="role" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Status</label>
            <select name="status" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} defaultValue="applied">
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              height: '35px',
            }}
          >
            {create.isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
}
