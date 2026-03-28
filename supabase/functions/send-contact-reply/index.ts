import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req: Request) => {
  // مهم: مدیریت preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { messageId, replyText } = await req.json();

    if (!messageId || !replyText || String(replyText).trim() === '') {
      return new Response(
        JSON.stringify({ error: 'messageId and replyText are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const smtpHost = Deno.env.get('SMTP_HOST')!;
    const smtpPort = Number(Deno.env.get('SMTP_PORT') || '465');
    const smtpSecure = Deno.env.get('SMTP_SECURE') === 'true';
    const smtpUser = Deno.env.get('SMTP_USER')!;
    const smtpPass = Deno.env.get('SMTP_PASS')!;
    const mailFrom = Deno.env.get('MAIL_FROM')!;

    if (!supabaseUrl || !serviceRoleKey || !smtpHost || !smtpUser || !smtpPass || !mailFrom) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // دریافت پیام
    const { data: contactMessage, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !contactMessage) {
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ارسال ایمیل
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const safeReplyText = String(replyText).replace(/\n/g, '<br />');
    const userName = contactMessage.name || 'کاربر عزیز';

    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.9; color: #1f2937;">
        <h2>سلام ${userName}</h2>
        <p>پاسخ ادمین برای پیام شما:</p>
        <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          ${safeReplyText}
        </div>
        <p>با احترام<br />تیم نزدیکو</p>
      </div>
    `;

    await transporter.sendMail({
      from: mailFrom,
      to: contactMessage.email,
      subject: "پاسخ به پیام شما | Nazdikoo",
      html: emailHtml,
    });

    // به‌روزرسانی دیتابیس
    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({
        admin_reply: replyText,
        is_read: true,
        is_replied: true,
        reply_status: 'sent',
        reply_error: null,
        replied_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Reply sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});