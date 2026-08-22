import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Loader2, Mail, ExternalLink, Archive, CheckCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

type Message = {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
};

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const updateMessageStatus = async (id: string, newStatus: 'new' | 'read' | 'replied' | 'archived') => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      return false;
    }
    
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status: newStatus } : m));
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    }
    return true;
  };

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (msg.status === 'new') {
      await updateMessageStatus(msg.id, 'read');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-neutral-100 text-neutral-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-neutral-200 text-neutral-600';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredMessages = messages.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 h-[calc(100vh-var(--nav-height))] overflow-hidden flex flex-col">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Contact Messages</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage inquiries and support requests from the storefront.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchMessages}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-6 min-h-0 flex-1">
        {/* Left Col: List */}
        <div className="w-1/3 min-w-[320px] max-w-sm flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden shrink-0">
          <div className="p-4 border-b border-neutral-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search name or email..." 
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">No messages found.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredMessages.map(msg => (
                  <button 
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${selectedMessage?.id === msg.id ? 'bg-brand-50 hover:bg-brand-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-neutral-900 truncate pr-2">{msg.full_name}</span>
                      <span className="text-xs text-neutral-400 whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 mb-2 truncate">
                      {msg.subject || 'No Subject'}
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-neutral-500 truncate pr-2 flex-1">
                        {msg.message}
                      </span>
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeColor(msg.status)}`}>
                        {msg.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Detail View */}
        <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden min-w-0">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-neutral-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-medium text-neutral-900">{selectedMessage.subject || 'No Subject'}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-medium text-neutral-800">{selectedMessage.full_name}</span>
                      <span className="text-neutral-300">•</span>
                      <a href={`mailto:${selectedMessage.email}`} className="text-brand-600 hover:underline flex items-center gap-1">
                        {selectedMessage.email} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    disabled={selectedMessage.status === 'replied'}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-md text-xs font-medium disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Mark as Replied
                  </button>
                  <button 
                    onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                    disabled={selectedMessage.status === 'archived'}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 rounded-md text-xs font-medium disabled:opacity-50"
                  >
                    <Archive size={14} /> Archive
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto bg-neutral-50/30">
                <div className="text-sm text-neutral-500 mb-2">Message received on {new Date(selectedMessage.created_at).toLocaleString()}</div>
                <div className="bg-white p-6 border border-neutral-100 rounded-lg shadow-sm">
                  <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Your Inquiry')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors"
                  >
                    <Mail size={16} />
                    Reply via Email
                  </a>
                  <p className="text-xs text-neutral-500 mt-3">
                    Note: Email is currently the only contact method provided by the customer.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <Mail size={48} className="mb-4 text-neutral-300" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
