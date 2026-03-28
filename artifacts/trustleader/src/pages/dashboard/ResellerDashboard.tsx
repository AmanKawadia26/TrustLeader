import { Layout } from "@/components/Layout";
import { useResellerDashboard } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Users, Briefcase, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ResellerDashboard() {
  const { statsQuery, referralsQuery } = useResellerDashboard();
  const { data: stats, isLoading: statsLoading } = statsQuery;
  const { data: referralsData, isLoading: refsLoading } = referralsQuery({});

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Reseller Portal
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {statsLoading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto my-12" />
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="shadow-sm border-primary/10 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Earnings</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">${stats.total_earnings.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.pending_earnings.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_referrals}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved Referrals</CardTitle>
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved_referrals}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <h3 className="text-2xl font-bold mb-6">Recent Referrals</h3>
        
        {refsLoading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        ) : referralsData?.referrals?.length ? (
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {referralsData.referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{ref.business_name}</div>
                        <div className="text-xs text-muted-foreground">{ref.business_domain}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(ref.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline" 
                          className={
                            ref.status === 'paid' ? 'bg-green-100 text-green-800' :
                            ref.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {ref.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${ref.commission_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border rounded-2xl bg-card">
            <h3 className="text-lg font-medium mb-1">No referrals found</h3>
            <p className="text-muted-foreground">Start referring businesses to earn commissions.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
