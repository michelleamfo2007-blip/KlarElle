import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Mail, Search, Send, X, Clock, CheckCircle } from 'lucide-react';

function SuperSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Reply Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setTickets(data);
    setLoading(false);
  };

  const updateTicketStatus = async (id, status) => {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (!error) {
      setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    } else {
      alert("Failed to update status.");
    }
  };

  const updateTicketPriority = async (id, priority) => {
    const { error } = await supabase.from('support_tickets').update({ priority }).eq('id', id);
    if (!error) {
      setTickets(tickets.map(t => t.id === id ? { ...t, priority } : t));
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const { error } = await supabase.from('support_tickets').delete().eq('id', id);
    if (!error) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    
    setSendingReply(true);
    
    try {
      const res = await fetch('/api/reply-support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedTicket.customer_email,
          subject: selectedTicket.subject,
          replyText: replyText,
          originalMessage: selectedTicket.message
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Reply sent successfully via email!");
        // Automatically close the ticket if replied
        await updateTicketStatus(selectedTicket.id, 'Closed');
        setSelectedTicket(null);
        setReplyText('');
      } else {
        alert("Failed to send reply: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert("Error sending reply: " + err.message);
    }
    
    setSendingReply(false);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Support Tickets</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Manage and reply to customer inquiries.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by customer, email, or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#6b7280' }}>No tickets found.</div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ticket.subject}
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                        background: ticket.status === 'Closed' ? '#f3f4f6' : ticket.status === 'In Progress' ? '#dbeafe' : '#fef9c3',
                        color: ticket.status === 'Closed' ? '#4b5563' : ticket.status === 'In Progress' ? '#1e40af' : '#854d0e'
                      }}>{ticket.status}</span>
                    </h3>
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14}/> {ticket.customer_name} ({ticket.customer_email})</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <select 
                      value={ticket.priority} 
                      onChange={(e) => updateTicketPriority(ticket.id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', outline: 'none', border: '1px solid #d1d5db', cursor: 'pointer',
                        color: ticket.priority === 'High' ? '#dc2626' : ticket.priority === 'Medium' ? '#d97706' : '#4b5563',
                        background: ticket.priority === 'High' ? '#fef2f2' : ticket.priority === 'Medium' ? '#fffbeb' : '#f9fafb',
                      }}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                </div>
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '6px', fontSize: '14px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                  {ticket.message}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => setSelectedTicket(ticket)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <MessageSquare size={16} /> Reply via Email
                  </button>
                  {ticket.status !== 'Closed' && (
                    <button onClick={() => updateTicketStatus(ticket.id, 'Closed')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      <CheckCircle size={16} /> Mark as Closed
                    </button>
                  )}
                  <button onClick={() => deleteTicket(ticket.id)} style={{ padding: '8px 16px', background: 'transparent', color: '#dc2626', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginLeft: 'auto' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedTicket(null)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '8px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={20}/> Reply to {selectedTicket.customer_name}</h3>
              <X size={20} onClick={() => setSelectedTicket(null)} style={{ cursor: 'pointer', color: '#9ca3af' }} />
            </div>
            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
              <strong>To:</strong> {selectedTicket.customer_email}<br/>
              <strong>Subject:</strong> Re: {selectedTicket.subject}
            </div>
            <form onSubmit={sendReply}>
              <textarea 
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your email reply here..."
                rows="8"
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setSelectedTicket(null)} style={{ padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={sendingReply} style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: sendingReply ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: sendingReply ? 0.7 : 1 }}>
                  <Send size={16} /> {sendingReply ? 'Sending...' : 'Send Email Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperSupport;
