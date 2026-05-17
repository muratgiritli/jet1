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
      <DialogContent className="sm:max-w-md max-w-[94vw] max-h-[88vh] overflow-y-auto p-4" data-testid="dialog-contact">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="w-4 h-4 text-primary" />
            İletişime Geç
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug">
            Sorularınız ve önerileriniz için bize ulaşın. En kısa sürede dönüş yapacağız.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center" data-testid="contact-success">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-800">Mesajınız iletildi!</p>
            <p className="text-xs text-muted-foreground mt-1">En kısa sürede sizinle iletişime geçeceğiz.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="space-y-1">
              <Label htmlFor="contact-name" className="text-xs">İsim Soyisim *</Label>
              <Input id="contact-name" className="h-9 text-sm" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required data-testid="input-contact-name" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="contact-phone" className="text-xs">Telefon *</Label>
                <Input id="contact-phone" className="h-9 text-sm" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="05XX XXX XX XX" required data-testid="input-contact-phone" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-email" className="text-xs">E-posta</Label>
                <Input id="contact-email" className="h-9 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={150} placeholder="opsiyonel" data-testid="input-contact-email" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-subject" className="text-xs">Konu</Label>
              <Input id="contact-subject" className="h-9 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="Sipariş, ürün, öneri vb." data-testid="input-contact-subject" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-message" className="text-xs">Mesajınız *</Label>
              <Textarea id="contact-message" className="text-sm" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={3} required data-testid="input-contact-message" />
              <p className="text-[10px] text-muted-foreground text-right">{message.length}/2000</p>
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={submitting} data-testid="btn-contact-submit">
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
