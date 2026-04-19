import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName(""); setPhone(""); setEmail(""); setSubject(""); setMessage(""); setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast({ title: "Eksik bilgi", description: "İsim, telefon ve mesaj alanları zorunludur.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact-messages", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        subject: subject.trim() || null,
        message: message.trim(),
      });
      setSuccess(true);
      setTimeout(() => { onOpenChange(false); reset(); }, 2200);
    } catch (err: any) {
      toast({ title: "Mesaj gönderilemedi", description: err?.message || "Lütfen tekrar deneyin.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(reset, 300); }}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-contact">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            İletişime Geç
          </DialogTitle>
          <DialogDescription>
            Sorularınız ve önerileriniz için bize ulaşın. En kısa sürede dönüş yapacağız.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center" data-testid="contact-success">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-800">Mesajınız iletildi!</p>
            <p className="text-sm text-muted-foreground mt-1">En kısa sürede sizinle iletişime geçeceğiz.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="contact-name">İsim Soyisim *</Label>
              <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required data-testid="input-contact-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact-phone">Telefon *</Label>
                <Input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="05XX XXX XX XX" required data-testid="input-contact-phone" />
              </div>
              <div>
                <Label htmlFor="contact-email">E-posta</Label>
                <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={150} placeholder="opsiyonel" data-testid="input-contact-email" />
              </div>
            </div>
            <div>
              <Label htmlFor="contact-subject">Konu</Label>
              <Input id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="Sipariş, ürün, öneri vb." data-testid="input-contact-subject" />
            </div>
            <div>
              <Label htmlFor="contact-message">Mesajınız *</Label>
              <Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} required data-testid="input-contact-message" />
              <p className="text-[11px] text-muted-foreground text-right mt-1">{message.length}/2000</p>
            </div>
            <Button type="submit" className="w-full" disabled={submitting} data-testid="btn-contact-submit">
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gönderiliyor...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Gönder</>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
