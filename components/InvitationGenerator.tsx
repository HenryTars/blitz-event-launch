import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Share2, QrCode, Mail } from 'lucide-react';

interface InvitationGeneratorProps {
  eventId: string;
  eventTitle: string;
}

export default function InvitationGenerator({ eventId, eventTitle }: InvitationGeneratorProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const generateInvitation = async () => {
    if (!guestName.trim()) return;

    setIsLoading(true);
    setError('');
    setInfo('');

    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventId,
        guestName,
        email: guestEmail,
        phone: guestPhone
      })
    });

    const result = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(result.error || 'Unable to create invitation');
      return;
    }

    const inviteLink = `${window.location.origin}/invite/${result.token}`;
    setGeneratedLink(inviteLink);
    setShowQrCode(false);
    setInfo(result.duplicated ? 'Existing invitation reused for this guest email.' : 'Invitation generated.');

    const message = `Dear ${guestName}, you are warmly invited to the official launch of "${eventTitle}". Reserve your presence here: ${inviteLink}`;
    setWhatsappMessage(message);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shareViaWhatsApp = () => {
    if (!whatsappMessage) return;
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const qrCodeUrl = generatedLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(generatedLink)}`
    : '';

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Generate Personal Invitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guestName" className="text-white">Guest Name</Label>
            <Input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter guest name"
              className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
            />
          </div>
          <div>
            <Label htmlFor="guestEmail" className="text-white">Email (Optional)</Label>
            <Input
              id="guestEmail"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="guest@example.com"
              className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="guestPhone" className="text-white">Phone (Optional)</Label>
            <Input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+255..."
              className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}
        {info && (
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{info}</div>
        )}

        <Button onClick={generateInvitation} disabled={!guestName.trim() || isLoading} className="w-full">
          {isLoading ? 'Generating...' : 'Generate Invitation'}
        </Button>

        {generatedLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <Label className="text-white">Personal Invitation Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={generatedLink}
                  readOnly
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={shareViaWhatsApp} variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button onClick={() => setShowQrCode((current) => !current)} variant="secondary" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                {showQrCode ? 'Hide QR' : 'QR Code'}
              </Button>
              <Button
                onClick={() => copyToClipboard(whatsappMessage)}
                variant="secondary"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Message
              </Button>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <Label className="text-white text-sm">WhatsApp Message Preview</Label>
              <p className="text-slate-300 text-sm mt-1">{whatsappMessage}</p>
            </div>

            {showQrCode && qrCodeUrl && (
              <div className="flex justify-center rounded-lg border border-white/10 bg-white p-4">
                <img src={qrCodeUrl} alt={`Invitation QR code for ${guestName}`} width={220} height={220} />
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
