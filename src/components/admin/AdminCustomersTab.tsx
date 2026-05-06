import React from 'react';

interface Customer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  created_at: string;
}

export const AdminCustomersTab = ({ customers }: { customers: Customer[] }) => {
  return (
    <div className="bg-white rounded-[40px] border border-[#F5ECD7] overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-[#F8F9FA] border-b border-[#F5ECD7]">
          <tr>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Customer</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Contact Email</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Account Joined</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40 text-right">Activity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5ECD7]">
          {customers.map((c) => {
            const customerId = c.id || c._id || "cust";
            return (
              <tr key={customerId} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-8 py-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5ECD7] flex items-center justify-center font-bold text-sm">
                    {c.name?.[0] || 'U'}
                  </div>
                  <span className="font-bold">{c.name || "Anonymous User"}</span>
                </td>
                <td className="px-8 py-6 text-sm font-medium">{c.email}</td>
                <td className="px-8 py-6 text-xs font-bold text-[#900C3F]/40 uppercase tracking-widest">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase border border-green-100">
                    Verified
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
