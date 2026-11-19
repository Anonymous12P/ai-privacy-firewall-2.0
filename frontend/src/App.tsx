import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AdaptiveLearningPage } from './pages/AdaptiveLearningPage'
import { AiAnalyticsPage } from './pages/AiAnalyticsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DigitalTwinPage } from './pages/DigitalTwinPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { FirewallEnginePage } from './pages/FirewallEnginePage'
import { LiveMonitoringPage } from './pages/LiveMonitoringPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PolicyEnginePage } from './pages/PolicyEnginePage'
import { RegisterPage } from './pages/RegisterPage'
import { SettingsPage } from './pages/SettingsPage'
import { UbaPage } from './pages/UbaPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicRoute } from './routes/PublicRoute'

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected Enterprise Security Console Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
          <Route path="/firewall-engine" element={<FirewallEnginePage />} />
          <Route path="/uba" element={<UbaPage />} />
          <Route path="/ai-analytics" element={<AiAnalyticsPage />} />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/policy-engine" element={<PolicyEnginePage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/adaptive-learning" element={<AdaptiveLearningPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Backward-Compatible Redirects for Preserved Routing Stability */}
          <Route path="/engine" element={<Navigate to="/firewall-engine" replace />} />
          <Route path="/live-monitor" element={<Navigate to="/live-monitoring" replace />} />
          <Route path="/firewall-monitor" element={<Navigate to="/live-monitoring" replace />} />
          <Route path="/behavior-analytics" element={<Navigate to="/uba" replace />} />
          <Route path="/analytics" element={<Navigate to="/ai-analytics" replace />} />
          <Route path="/organization" element={<Navigate to="/digital-twin" replace />} />
          <Route path="/policy-builder" element={<Navigate to="/policy-engine" replace />} />
          <Route path="/policies" element={<Navigate to="/policy-engine" replace />} />
          <Route path="/experiments" element={<Navigate to="/ai-analytics" replace />} />
          <Route path="/evaluation" element={<Navigate to="/ai-analytics" replace />} />
          <Route path="/access-requests" element={<Navigate to="/live-monitoring" replace />} />
          <Route path="/scan" element={<Navigate to="/live-monitoring" replace />} />
          <Route path="/history" element={<Navigate to="/audit-logs" replace />} />
          <Route path="/research-summary" element={<Navigate to="/ai-analytics" replace />} />
          <Route path="/documentation" element={<Navigate to="/dashboard" replace />} />
          <Route path="/threat-detection" element={<Navigate to="/dashboard" replace />} />
          <Route path="/threat-intelligence" element={<Navigate to="/dashboard" replace />} />
          <Route path="/incidents" element={<Navigate to="/dashboard" replace />} />
          <Route path="/grc" element={<Navigate to="/settings" replace />} />
          <Route path="/admin" element={<Navigate to="/settings" replace />} />
          <Route path="/profile" element={<Navigate to="/employees" replace />} />
          <Route path="/demo" element={<Navigate to="/firewall-engine" replace />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
