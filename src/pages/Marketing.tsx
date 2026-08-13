import { useState } from 'react';
import { Send, Clock, Users, Mail, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Marketing() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    segment: 'all',
    channel: 'email',
    template: 'abandoned_cart',
    message: '',
    scheduleDate: '',
    scheduleTime: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to 3rd party email/SMS provider
    setTimeout(() => {
      setLoading(false);
      toast.success(`Campaign "${formData.name}" scheduled successfully! (Stubbed)`);
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
    }, 1500);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
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
                    <option value="registered">Registered Customers Only</option>
                    <option value="guest">Guest Customers Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Channel</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="channel" value="email" checked={formData.channel === 'email'} onChange={handleChange} className="text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-neutral-700 flex items-center gap-1"><Mail className="w-4 h-4"/> Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="channel" value="sms" checked={formData.channel === 'sms'} onChange={handleChange} className="text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-neutral-700 flex items-center gap-1"><MessageSquare className="w-4 h-4"/> SMS</span>
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

        {/* Right Column: Upcoming Campaigns (Stub) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-medium text-neutral-900">Upcoming Campaigns</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              
              <div className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-neutral-900">Eid Mega Sale</h4>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold uppercase tracking-wider">SMS</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2">Segment: All Customers</p>
                <div className="flex items-center gap-1 text-xs font-medium text-brand-600">
                  <Clock className="w-3 h-3" />
                  Tomorrow, 10:00 AM
                </div>
              </div>

              <div className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-neutral-900">Win-back Flow</h4>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold uppercase tracking-wider">Email</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2">Segment: Guest Customers</p>
                <div className="flex items-center gap-1 text-xs font-medium text-brand-600">
                  <Clock className="w-3 h-3" />
                  Oct 15, 2:00 PM
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
