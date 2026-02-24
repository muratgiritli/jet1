import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, MapPin, LogOut, Loader2, Check, Edit2 } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import jet55Logo from "@assets/Ekran_görüntüsü_2026-02-24_020948_1771888203864.png";

export default function ProfilePage() {
  const { customer, isLoggedIn, isLoading, logout, updateProfile } = useCustomer();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) {
    setLocation("/giris");
    return null;
  }

  const startEdit = () => {
    setEditName(customer?.name || "");
    setEditAddress(customer?.address || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      toast({ title: "Hata", description: "Ad soyad boş bırakılamaz", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: editName.trim(), address: editAddress.trim() });
      setEditing(false);
      toast({ title: "Bilgiler guncellendi" });
    } catch {
      toast({ title: "Hata", description: "Bilgiler guncellenemedi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Cikis yapildi" });
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#6B3480" }}>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center">
          <Link href="/">
            <img src={jet55Logo} alt="JET55" className="h-10 object-contain cursor-pointer" data-testid="img-profile-logo" />
          </Link>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" data-testid="text-profile-title">Hesabim</h1>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEdit} data-testid="btn-profile-edit">
              <Edit2 className="w-4 h-4 mr-1" />
              Duzenle
            </Button>
          )}
        </div>

        <Card className="mb-4">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                <Phone className="w-4 h-4" />
                Telefon
              </label>
              <p className="text-sm font-medium" data-testid="text-profile-phone">
                +90 {customer?.phone}
              </p>
            </div>

            {editing ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-4 h-4" />
                    Ad Soyad
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    data-testid="input-profile-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Adres
                  </label>
                  <Textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Teslimat adresiniz"
                    rows={3}
                    data-testid="input-profile-address"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1"
                    style={{ backgroundColor: "#6B3480" }}
                    data-testid="btn-profile-save"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} data-testid="btn-profile-cancel">
                    Vazgec
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-4 h-4" />
                    Ad Soyad
                  </label>
                  <p className="text-sm font-medium" data-testid="text-profile-name">{customer?.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Adres
                  </label>
                  <p className="text-sm" data-testid="text-profile-address">
                    {customer?.address || <span className="text-muted-foreground italic">Henuz adres eklenmemis</span>}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          data-testid="btn-profile-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cikis Yap
        </Button>
      </div>
    </div>
  );
}
