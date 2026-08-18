import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Mock function for sending email
async function sendCampaignEmail(to: string, subject: string, body: string) {
  // TODO: Replace with real provider (Resend, SendGrid, etc.)
  console.log(`[STUB] Sending email to: ${to}`);
  console.log(`[STUB] Subject: ${subject}`);
  console.log(`[STUB] Body: ${body}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Query due campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString());

    if (campaignError) throw campaignError;

    if (!campaigns || campaigns.length === 0) {
      return new Response(JSON.stringify({ message: 'No campaigns due for sending.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const results = [];

    for (const campaign of campaigns) {
      try {
        let emails: string[] = [];

        // 2. Resolve audience
        if (campaign.segment === 'all') {
          // Get distinct emails from orders
          const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('email')
            .not('email', 'is', null);

          if (orderError) throw orderError;
          
          if (orders) {
            const uniqueEmails = new Set(orders.map(o => o.email).filter(e => e && e.trim() !== ''));
            emails = Array.from(uniqueEmails);
          }
        }

        // 3. Send emails
        if (emails.length > 0) {
          console.log(`Processing campaign "${campaign.name}" (${campaign.id}) for ${emails.length} recipients...`);
          
          for (const email of emails) {
            await sendCampaignEmail(email, campaign.subject || campaign.name, campaign.message_content);
          }
        } else {
          console.log(`Campaign "${campaign.name}" has no valid recipients. Marking as sent anyway.`);
        }

        // 4. Update status
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', campaign.id);

        if (updateError) throw updateError;
        
        results.push({ id: campaign.id, status: 'sent', recipients: emails.length });
      } catch (err) {
        console.error(`Failed to process campaign ${campaign.id}:`, err);
        // Mark as failed
        await supabase
          .from('campaigns')
          .update({ status: 'failed' })
          .eq('id', campaign.id);
          
        results.push({ id: campaign.id, status: 'failed', error: String(err) });
      }
    }

    return new Response(JSON.stringify({ message: 'Processed campaigns', results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
