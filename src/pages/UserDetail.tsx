import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, CreditCard, Mail, Pencil, Save, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Segment, User } from '../data/mockData';
import { computeUserStats } from '../utils/kpiCalculations';
import { formatDate, formatLastActive, formatNumber, toDateInputValue } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const INPUT_CLASSES =
  'w-full py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#57288F] focus:ring-1 focus:ring-[#57288F]';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, transactions, updateUser } = useData();
  const [user, setUser] = useState<User>();
  const [segment, setSegment] = useState<Segment>('Individual');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingFinancials, setIsEditingFinancials] = useState(false);
  const [lifetimeValue, setLifetimeValue] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState('');

  useEffect(() => {
    document.title = 'Eloquent Case Study';
  }, []);

  // Load the client after the first render, and again after every save, like the reference.
  // The first render shows "Loading entity...". That short page also puts the scroll
  // position back at the top when you arrive from a scrolled dashboard.
  useEffect(() => {
    const found = users.find((u) => u.id === id);
    if (!found) return;
    const stats = computeUserStats(found, transactions);
    setUser(found);
    setSegment(found.segment);
    setLifetimeValue(stats.totalSpent);
    setTransactionCount(stats.txCount);
    setLastActivityDate(toDateInputValue(stats.lastActivityISO));
  }, [id, users, transactions]);

  // Unknown ids stay on this message
  if (!user) {
    return <div className="p-8 text-center text-gray-500">Loading entity...</div>;
  }

  // Shown values come from saved data only, so they stay fixed until Save
  const stats = computeUserStats(user, transactions);

  const handleSave = async () => {
    setIsSaving(true);
    const updates: Partial<User> = { segment };
    // Financial values are saved only while the Financial Overview is in edit mode
    if (isEditingFinancials) {
      updates.lifetimeValueOverride = lifetimeValue;
      updates.transactionCountOverride = transactionCount;
      // An empty date keeps the previous value
      if (lastActivityDate) {
        updates.lastActivityOverride = new Date(lastActivityDate).toISOString();
      }
    }
    await updateUser(user.id, updates);
    setIsSaving(false);
    setIsEditingFinancials(false);
    navigate('/');
  };

  const toggleFinancialEdit = () => {
    if (isEditingFinancials) {
      // Cancel: put the saved values back in the inputs
      setLifetimeValue(stats.totalSpent);
      setTransactionCount(stats.txCount);
      setLastActivityDate(toDateInputValue(stats.lastActivityISO));
    }
    setIsEditingFinancials(!isEditingFinancials);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-500 hover:text-[#57288F] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium mr-3">
              ID: {user.id}
            </span>
            <span>Joined {formatDate(user.joinDate)}</span>
          </div>
        </div>
        <Button variant="success" onClick={handleSave} isLoading={isSaving} className="shadow-md hover:shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-l-4 border-l-[#57288F]">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Entity Configuration</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as Segment)}
                className="w-full px-4 py-2.5 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-[#57288F] focus:ring-[#57288F] transition-all"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="SME">SME</option>
                <option value="Startup">Startup</option>
                <option value="Individual">Individual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-100 flex items-center justify-between">
                <span className="capitalize">{user.status}</span>
                <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
              <Building2 className="w-4 h-4 mr-2" /> Contact Details
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400">Email Address</div>
                <div className="text-gray-900 font-medium flex items-center">
                  <Mail className="w-3 h-3 mr-2 text-gray-400" />
                  {user.email}
                </div>
              </div>
            </div>
          </Card>

          {/* In edit mode the reference also adds shadow-md, but the card's shadow-sm
              wins on CSS order, so shadow-md is left out here. */}
          <Card className={`transition-all duration-300 ${isEditingFinancials ? 'ring-2 ring-[#57288F]/20' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" /> Financial Overview
              </h3>
              <Button variant="ghost" size="sm" onClick={toggleFinancialEdit}>
                {isEditingFinancials ? (
                  <span className="flex items-center text-gray-500">
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </span>
                ) : (
                  <span className="flex items-center text-[#57288F]">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </span>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Lifetime Value</div>
                {isEditingFinancials ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={lifetimeValue}
                      onChange={(e) => setLifetimeValue(Number(e.target.value))}
                      className={`${INPUT_CLASSES} pl-8 pr-4 text-[#57288F]`}
                    />
                  </div>
                ) : (
                  <div className="text-xl font-bold text-[#57288F]">${formatNumber(stats.totalSpent)}</div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">Total Transactions</div>
                {isEditingFinancials ? (
                  <input
                    type="number"
                    value={transactionCount}
                    onChange={(e) => setTransactionCount(Number(e.target.value))}
                    className={`${INPUT_CLASSES} px-4 text-gray-900`}
                  />
                ) : (
                  <div className="text-xl font-bold text-gray-900">{stats.txCount}</div>
                )}
              </div>

              <div className="col-span-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Last Activity</div>
                {isEditingFinancials ? (
                  <input
                    type="date"
                    value={lastActivityDate}
                    onChange={(e) => setLastActivityDate(e.target.value)}
                    className={`${INPUT_CLASSES} px-4 text-gray-900`}
                  />
                ) : (
                  <div className="text-sm font-medium text-gray-700 flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                    {formatLastActive(stats.lastActivityISO)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
