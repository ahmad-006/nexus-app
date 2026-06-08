import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';
import TicketNarrative from '../components/ticket/TicketNarrative';
import TicketSidebar from '../components/ticket/TicketSidebar';
import TicketDetailSkeleton from '../components/ticket/TicketDetailSkeleton';
import TicketActivity from '../components/ticket/TicketActivity';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/tickets/${id}`);
        setTicket(response.data.data.ticket);
      } catch (err) {
        console.error("Failed to fetch ticket:", err);
        setError("Could not load ticket details.");
        toast.error("Ticket not found or access denied.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchTicket();
  }, [id]);

  const handleOptimisticUpdate = async (updateData) => {
    // Save previous state for rollback
    const previousTicket = { ...ticket };
    
    // Optimistic UI Update
    setTicket(prev => ({ ...prev, ...updateData }));

    try {
      if (updateData.status) {
        await api.patch(`/tickets/${id}/status`, { status: updateData.status });
      } else {
        await api.patch(`/tickets/${id}`, updateData);
      }
      toast.success("Ticket updated");
    } catch (err) {
      console.error("Update failed:", err);
      // Rollback
      setTicket(previousTicket);
      toast.error(err.response?.data?.message || "Failed to update ticket");
    }
  };

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (error || !ticket) {
    return (
      <div className="h-full w-full bg-[#F8F9FA] flex flex-col items-center justify-center gap-4 relative">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        <p className="text-slate-500 font-medium z-10">{error || "Ticket not found"}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors z-10">
          Return to Board
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] relative">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Top Navigation */}
        <div>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Board
          </Link>
        </div>

        {/* 70/30 Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Group */}
          <div className="md:col-span-8 flex flex-col gap-8 w-full">
            <TicketNarrative ticket={ticket} onUpdate={handleOptimisticUpdate} />
            
            {/* Mobile Properties Ledger (Hidden on Desktop) */}
            <div className="block md:hidden">
              <TicketSidebar ticket={ticket} onUpdate={handleOptimisticUpdate} />
            </div>

            {/* Real-time Activity Thread */}
            <TicketActivity ticketId={ticket._id} />
          </div>

          {/* Right Sidebar Group (Hidden on Mobile) */}
          <div className="hidden md:block md:col-span-4 w-full">
            <TicketSidebar ticket={ticket} onUpdate={handleOptimisticUpdate} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default TicketDetail;
