
// Email utility for sending notifications
// In production, this would integrate with a service like SendGrid, AWS SES, or Resend

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    // For development/demo purposes, we'll just log the email
    // In production, integrate with your email service
    
    console.log('📧 Email Notification')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('---')
    console.log(text || html)
    console.log('---')

    // In production, uncomment and configure your email service:
    /*
    // Example with Resend:
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KeeperGo <noreply@keepergo.com>',
        to,
        subject,
        html
      })
    })
    
    return response.ok
    */

    return true // Mock success for development
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Email templates
export const emailTemplates = {
  bookingAccepted: (organizerName: string, goalkeeperName: string, date: Date, location: string) => ({
    subject: 'Goalkeeper Accepted Your Match!',
    html: `
      <h2>Great news, ${organizerName}!</h2>
      <p><strong>${goalkeeperName}</strong> has accepted your match booking.</p>
      <p><strong>Match Details:</strong></p>
      <ul>
        <li>Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>See you on the field!</p>
      <p>- KeeperGo Team</p>
    `,
    text: `Great news, ${organizerName}! ${goalkeeperName} has accepted your match booking on ${date.toLocaleDateString()} at ${location}.`
  }),

  bookingCancelled: (userName: string, role: string, date: Date, location: string, reason?: string) => ({
    subject: 'Match Booking Cancelled',
    html: `
      <h2>Match Cancellation Notice</h2>
      <p>Hi ${userName},</p>
      <p>A match booking has been cancelled.</p>
      <p><strong>Match Details:</strong></p>
      <ul>
        <li>Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
        <li>Location: ${location}</li>
        ${reason ? `<li>Reason: ${reason}</li>` : ''}
      </ul>
      <p>${role === 'ORGANIZER' ? 'You can book another goalkeeper from your dashboard.' : 'You can find more opportunities in your dashboard.'}</p>
      <p>- KeeperGo Team</p>
    `,
    text: `Hi ${userName}, a match on ${date.toLocaleDateString()} at ${location} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`
  }),

  matchReminder: (userName: string, role: string, date: Date, location: string, hoursUntil: number) => ({
    subject: `Match Reminder - ${hoursUntil}h until your match`,
    html: `
      <h2>Match Reminder 🚨</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder that you have a match coming up in <strong>${hoursUntil} hours</strong>!</p>
      <p><strong>Match Details:</strong></p>
      <ul>
        <li>Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>${role === 'ORGANIZER' ? 'Make sure everything is ready for the match!' : 'Don\'t forget your gear!'}</p>
      <p>Good luck!</p>
      <p>- KeeperGo Team</p>
    `,
    text: `Hi ${userName}, reminder: You have a match in ${hoursUntil} hours on ${date.toLocaleDateString()} at ${location}.`
  }),

  paymentReceived: (goalkeeperName: string, amount: number, date: Date) => ({
    subject: 'Payment Received!',
    html: `
      <h2>Payment Received! 💰</h2>
      <p>Hi ${goalkeeperName},</p>
      <p>Great news! Your payment has been processed.</p>
      <p><strong>Payment Details:</strong></p>
      <ul>
        <li>Amount: €${(amount / 100).toFixed(2)}</li>
        <li>Match Date: ${date.toLocaleDateString()}</li>
      </ul>
      <p>The funds will be transferred to your connected bank account within 2-3 business days.</p>
      <p>- KeeperGo Team</p>
    `,
    text: `Hi ${goalkeeperName}, you received a payment of €${(amount / 100).toFixed(2)} for your match on ${date.toLocaleDateString()}.`
  })
}
