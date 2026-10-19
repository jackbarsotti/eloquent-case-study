import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Segment, Transaction, User } from '../data/mockData';
import { computeUserStats } from '../utils/kpiCalculations';
import { formatLastActive, formatNumber, formatShortDate } from '../utils/format';
import { Card } from './ui/Card';

// Rows per page are fitted to the window height using these sizes (px)
const ROW_HEIGHT = 57;
const PAGINATION_HEIGHT = 52;
const BOTTOM_PADDING = 24;
const MIN_ROWS = 3;

const SEGMENT_BADGE_CLASSES: Record<Segment, string> = {
  Enterprise: 'bg-purple-100 text-purple-800',
  SME: 'bg-blue-100 text-blue-800',
  Startup: 'bg-gray-100 text-gray-800',
  Individual: 'bg-gray-100 text-gray-800',
};

const PAGE_ARROW_CLASSES =
  'p-2 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-sm';

interface UserTableProps {
  users: User[];
  transactions: Transaction[];
}

export function UserTable({ users, transactions }: UserTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const calculateRows = useCallback(() => {
    if (!tableBodyRef.current) return;
    const tableBodyTop = tableBodyRef.current.getBoundingClientRect().top;
    const availableHeight = window.innerHeight - tableBodyTop - PAGINATION_HEIGHT - BOTTOM_PADDING;
    setItemsPerPage(Math.max(MIN_ROWS, Math.floor(availableHeight / ROW_HEIGHT)));
  }, []);

  useEffect(() => {
    // Short delay so the layout is settled before measuring
    const timer = setTimeout(calculateRows, 50);
    window.addEventListener('resize', calculateRows);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateRows);
    };
  }, [calculateRows]);

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  // Go back to page 1 when the current page no longer exists
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9F6F0] text-gray-600 font-medium border border-gray-200">
              <tr>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Segment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4 text-right">Total Spent</th>
                <th className="px-6 py-4 text-right">Transactions</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody ref={tableBodyRef} className="divide-y divide-gray-50">
              {currentUsers.map((user) => {
                const stats = computeUserStats(user, transactions);
                const isActive = user.status === 'active';
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEGMENT_BADGE_CLASSES[user.segment]}`}
                      >
                        {user.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatShortDate(user.joinDate)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${formatNumber(stats.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">{stats.txCount}</td>
                    <td className="px-6 py-4 text-gray-600">{formatLastActive(stats.lastActivityISO)}</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#57288F] transition-colors inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="bg-[#F9F6F0] pt-3 pb-2 -mx-1 px-1">
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of{' '}
              {users.length} entities
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={PAGE_ARROW_CLASSES}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === page ? 'bg-[#57288F] text-white shadow-md' : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={PAGE_ARROW_CLASSES}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
