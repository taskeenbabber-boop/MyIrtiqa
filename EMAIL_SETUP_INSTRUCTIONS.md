# Email Setup Instructions for IRTIQA

## Overview
Order confirmation emails are now set up! Customers will receive an automatic email when they place an order.

## Required Setup Steps

### 1. Create a Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Free tier includes **100 emails/day** and **3,000 emails/month**

### 2. Verify Your Domain (Recommended for Production)
1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `irtiqa.com`)
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually takes a few minutes)

**Note**: If you skip domain verification, emails will be sent from `onboarding@resend.dev` which works for testing but may end up in spam folders.

### 3. Create API Key
1. Go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name like "IRTIQA Production"
4. Copy the API key (you'll only see it once!)

### 4. Add API Key to Lovable
1. In Lovable, go to **Settings** → **Secrets**
2. Click "Add Secret"
3. Name: `RESEND_API_KEY`
4. Value: Paste your Resend API key
5. Click "Save"

### 5. Update Email Sender (After Domain Verification)
Once your domain is verified, update the sender email in:
`supabase/functions/send-order-confirmation/index.ts`

Change this line:
```typescript
from: "IRTIQA <onboarding@resend.dev>", // Change this to your verified domain
```

To:
```typescript
from: "IRTIQA <orders@irtiqa.com>", // Use your actual domain
```

## Order Tracking

### Current Implementation
- Customers receive confirmation email immediately after order placement
- Email includes:
  - Order ID
  - Product details
  - Amount paid
  - Status (Pending Verification)
  - Link to view their library

### Customer Can Track Order By:
1. **Email Notifications**: They receive emails at key stages
   - Order submitted (confirmation)
   - Order approved (access granted) - *can be added*
   - Order rejected - *can be added*

2. **Account Dashboard**: When logged in, users can:
   - Go to "My Library" to see their courses
   - Access is granted automatically after admin approval

3. **Order Status in Admin Dashboard**: Admins can see:
   - Customer name & email
   - Order date
   - Payment proof
   - Approve/Reject buttons

## Email Templates

### Current Email: Order Confirmation
Sent when customer submits order with payment proof.

### Recommended Additional Emails (Future Enhancement):

1. **Order Approved Email**: Sent when admin approves the order
   ```
   Subject: Your Order Has Been Approved - Access Granted!
   Content: Congratulations! Your payment has been verified...
   ```

2. **Order Rejected Email**: Sent if payment is rejected
   ```
   Subject: Issue with Your Order - Action Required
   Content: We couldn't verify your payment. Please contact support...
   ```

## Testing the Email System

1. Place a test order through the website
2. Check the email address used for the order
3. Verify the confirmation email was received
4. Check spam folder if not in inbox

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify `RESEND_API_KEY` is set correctly in Lovable Secrets
- Check Supabase Edge Function logs for errors
- Ensure email address is valid

### Emails Going to Spam
- Verify your domain with Resend
- Use a custom domain email (not @resend.dev)
- Add SPF and DKIM records (Resend provides these)

### View Edge Function Logs
In Lovable:
1. Go to **Cloud** → **Edge Functions**
2. Click on `send-order-confirmation`
3. View logs for any errors

## Cost Considerations

### Resend Pricing
- **Free**: 100 emails/day, 3,000/month
- **Pro ($20/mo)**: 50,000 emails/month
- **Business**: Custom pricing

For most small to medium businesses, the free tier is sufficient.

## Support

If you need help:
1. Check [Resend Documentation](https://resend.com/docs)
2. Review Edge Function logs in Lovable
3. Contact support@irtiqa.com
