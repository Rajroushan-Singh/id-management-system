import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  ShieldAlert,
  Clock,
  Layers,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginRiskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Login Risk Assessment"
        subtitle="Behavioral heuristics and real-time risk scoring for identity authentication attempts."
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-status-warning-bg text-status-warning font-semibold border border-status-warning-border">
            Under Development (Pending Backend Service)
          </span>
        }
      />

      {/* Development Status Banner */}
      <div className="p-5 rounded-card bg-cream-50 border border-cream-400 text-espresso-700 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-status-warning-bg text-status-warning border border-status-warning-border flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="font-display text-sm font-semibold text-espresso-800">
            Backend Risk Engine Contract Pending
          </h4>
          <p className="text-xs text-espresso-600 leading-relaxed">
            The frontend interface is pre-configured according to the IAM product specification.
            To adhere to security integrity rules, no synthetic or fake risk scores are generated.
            Real-time scoring telemetry will activate automatically once <code className="text-espresso-800 font-mono bg-cream-200 px-1 py-0.5 rounded">LoginRiskService</code> and client IP extraction are wired in the Spring Boot backend.
          </p>
        </div>
      </div>

      {/* Target Response Contract Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Planned Risk Scoring Model */}
        <Card title="Proposed Heuristic Model" subtitle="Weighted risk factors defined in project specification">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-control bg-cream-50 border border-cream-400/80 text-xs">
              <div>
                <p className="font-semibold text-espresso-800">Multiple Recent Failed Logins</p>
                <p className="text-espresso-500 text-[11px]">Consecutive failures in rolling 15-minute window</p>
              </div>
              <span className="font-mono font-bold text-status-warning bg-status-warning-bg px-2 py-0.5 rounded border border-status-warning-border">
                +30 pts
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-control bg-cream-50 border border-cream-400/80 text-xs">
              <div>
                <p className="font-semibold text-espresso-800">Unfamiliar / New IP Address</p>
                <p className="text-espresso-500 text-[11px]">Login from previously unseen subnet or client IP</p>
              </div>
              <span className="font-mono font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded border border-sage-200">
                +20 pts
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-control bg-cream-50 border border-cream-400/80 text-xs">
              <div>
                <p className="font-semibold text-espresso-800">Rapid Login Velocity</p>
                <p className="text-espresso-500 text-[11px]">Multiple attempts exceeding baseline human velocity</p>
              </div>
              <span className="font-mono font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded border border-sage-200">
                +20 pts
              </span>
            </div>

            <div className="pt-2 text-xs text-espresso-500">
              <span className="font-semibold text-espresso-700">Threshold Bands: </span>
              <span>LOW (0–19), MEDIUM (20–49), HIGH (50+)</span>
            </div>
          </div>
        </Card>

        {/* Backend Implementation Checklist */}
        <Card title="Backend Work Required" subtitle="Dependencies prior to live frontend integration">
          <ul className="space-y-2.5 text-xs text-espresso-700">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-cream-200 text-espresso-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Client IP Capture:</strong> Extract remote IP safely in <code className="text-espresso-800 font-mono bg-cream-100 px-1 py-0.2 rounded">AuthService</code> without blind trust of spoofed headers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-cream-200 text-espresso-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>LoginRiskService:</strong> Implement scoring calculation against recent <code className="text-espresso-800 font-mono bg-cream-100 px-1 py-0.2 rounded">audit_events</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-cream-200 text-espresso-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>Admin API Endpoint:</strong> Expose protected route (e.g. <code className="text-espresso-800 font-mono bg-cream-100 px-1 py-0.2 rounded">GET /api/admin/login-risk</code>) returning risk events.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-cream-200 text-espresso-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                4
              </span>
              <span>
                <strong>Policy Enforcement:</strong> Step-up verification or temporary throttling for HIGH risk scores.
              </span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-cream-400 flex items-center justify-between">
            <span className="text-xs text-espresso-500">Need immediate event inspection?</span>
            <Link to="/admin/audit">
              <Button variant="outline" size="sm" icon={ExternalLink} iconPosition="right">
                Explore Raw Audit Logs
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Target UI Skeleton Layout (Marked as Inactive Preview) */}
      <Card
        title="Telemetry Interface Wireframe"
        subtitle="Preview of live risk stream when backend contract is activated"
      >
        <div className="opacity-60 pointer-events-none select-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="p-4 rounded-card bg-cream-50 border border-cream-400">
              <span className="text-[10px] font-bold uppercase text-espresso-500">Risk Assessment Status</span>
              <p className="text-sm font-semibold text-espresso-800 mt-1">Pending Service Connection</p>
            </div>
            <div className="p-4 rounded-card bg-cream-50 border border-cream-400">
              <span className="text-[10px] font-bold uppercase text-espresso-500">Average Risk Score</span>
              <p className="text-sm font-semibold text-espresso-800 mt-1">—</p>
            </div>
            <div className="p-4 rounded-card bg-cream-50 border border-cream-400">
              <span className="text-[10px] font-bold uppercase text-espresso-500">High Risk Events Today</span>
              <p className="text-sm font-semibold text-espresso-800 mt-1">—</p>
            </div>
          </div>
          <div className="border border-cream-400 rounded-card p-6 text-center text-xs text-espresso-500 bg-cream-100/50">
            Real-time tabular risk assessments will appear here once the API endpoint is active.
          </div>
        </div>
      </Card>
    </div>
  );
}
