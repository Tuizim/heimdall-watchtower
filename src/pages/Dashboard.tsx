import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardMain } from '../components/dashboard/DashboardMain';

export default function Dashboard() {
  return (
    <div className="space-y-12 pb-20">
      <DashboardHeader />
      <DashboardStats />
      <DashboardMain />
    </div>
  );
}
