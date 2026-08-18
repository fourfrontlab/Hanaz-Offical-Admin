import { useState, useEffect } from 'react';
import { Send, Clock, Users, Mail, MessageSquare, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Marketing() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    segment: 'all',
    channel: 'email',
    template: 'abandoned_cart',
    message: '',
    scheduleDate: '',
    scheduleTime: '',
  });

  const fetchCampaigns = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true });
        
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast.error('Failed to load campaigns: ' + error.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = e.target.value;
    let defaultMsg = '';
    
    if (template === 'abandoned_cart') {
      defaultMsg = "Hi there! We noticed you left some items in your cart. Complete your purchase now and get 10% off with code CART10.";
    } else if (template === 'cross_sell') {
      defaultMsg = "Loved your recent purchase? Pair it with our Hydrating Serum for the ultimate glow! Shop now.";
    }
    
    setFormData({ ...formData, template, message: defaultMsg });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message || !formData.scheduleDate || !formData.scheduleTime) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (formData.channel !== 'email') {
      toast.error("Only Email channel is currently supported.");
      return;
    }

    setLoading(true);
    
    try {
      const scheduled_at = new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString();
      
      const { error } = await supabase.from('campaigns').insert([{
        name: formData.name,
        segment: formData.segment,
        message_template: formData.template,
        subject: formData.name, // using name as subject for now
        message_content: formData.message,
        scheduled_at,
        status: 'scheduled'
      }]);

      if (error) throw error;

      toast.success(`Campaign "${formData.name}" scheduled successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        segment: 'all',
        channel: 'email',
        template: 'custom',
        message: '',
        scheduleDate: '',
        scheduleTime: '',
      });
      
      fetchCampaigns();
    } catch (error: any) {
      toast.error('Failed to schedule campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Campaign cancelled.');
      fetchCampaigns();
    } catch (error: any) {
      toast.error('Failed to cancel campaign: ' + error.message);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (diffDays === 0 && d.getDate() === now.getDate()) {
      return `Today, ${timeStr}`;
    } else if (diffDays === 1 || (diffDays === 0 && d.getDate() !== now.getDate())) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl font-medium">Marketing & CRM</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Campaign Builder */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-600" />
              <h3 className="font-medium text-neutral-900">Campaign Builder</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Campaign Name *</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Summer Sale Blast"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Target Audience Segment
                  </label>
                  <select 
                    name="segment"
                    value={formData.segment}
                    onChange={handleChange}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="all">All Customers</option>
                    <option value="registered" disabled>Registered Customers Only</option>
                    <option value="guest" disabled>Guest Customers Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Channel</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="channel" value="email" checked={formData.channel === 'email'} onChange={handleChange} className="text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-neutral-700 flex items-center gap-1"><Mail className="w-4 h-4"/> Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                      <input type="radio" name="channel" value="sms" disabled className="text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-neutral-700 flex items-center gap-1"><MessageSquare className="w-4 h-4"/> SMS <span className="text-[10px] bg-neutral-200 px-1.5 py-0.5 rounded">Coming Soon</span></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Message Template</label>
                <select 
                  name="template"
                  value={formData.template}
                  onChange={handleTemplateChange}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="custom">Custom Message</option>
                  <option value="abandoned_cart">Abandoned Cart Flow</option>
                  <option value="cross_sell">Post-Purchase Cross-sell</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Message Content *</label>
                <textarea 
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Type your message here..."
                />
                <p className="text-xs text-neutral-500 text-right">{formData.message.length} characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-neutral-100">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Schedule Date *
                  </label>
                  <input 
                    required
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleChange}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Schedule Time *</label>
                  <input 
                    required
                    type="time"
                    name="scheduleTime"
                    value={formData.scheduleTime}
                    onChange={handleChange}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Schedule Campaign
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Upcoming Campaigns */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-medium text-neutral-900">Upcoming Campaigns</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              
              {fetching ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-500">
                  No upcoming campaigns scheduled.
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 hover:bg-neutral-50 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium text-neutral-900">{campaign.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold uppercase tracking-wider">Email</span>
                        <button 
                          onClick={() => handleCancel(campaign.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          title="Cancel campaign"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">Segment: {campaign.segment === 'all' ? 'All Customers' : campaign.segment}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-brand-600">
                      <Clock className="w-3 h-3" />
                      {formatDate(campaign.scheduled_at)}
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
