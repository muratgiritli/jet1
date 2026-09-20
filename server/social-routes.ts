import type { Express, Request, Response, NextFunction } from "express";
import * as store from "./social-store";
import { SOCIAL_PHOTOS } from "@shared/social";

const COOKIE = "yp_sid";

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return undefined;
}

function isHttpsRequest(req: Request): boolean {
  const forwarded = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (forwarded === "https") return true;
  if (forwarded === "http") return false;
  return req.secure === true || req.protocol === "https";
}

function cookieFlags(req: Request, maxAge: number): string {
  const secure = isHttpsRequest(req) ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function setSessionCookie(req: Request, res: Response, token: string) {
  res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(token)}; ${cookieFlags(req, 14 * 24 * 3600)}`);
}

function clearSessionCookie(req: Request, res: Response) {
  res.setHeader("Set-Cookie", `${COOKIE}=; ${cookieFlags(req, 0)}`);
}

function currentMember(req: Request) {
  return store.getSessionMember(readCookie(req, COOKIE));
}

function memberLocale(req: Request): "tr" | "en" {
  return currentMember(req)?.locale === "en" ? "en" : "tr";
}

function tMsg(req: Request, tr: string, en: string) {
  return memberLocale(req) === "en" ? en : tr;
}

function requireMember(req: Request, res: Response): NonNullable<ReturnType<typeof currentMember>> | null {
  const member = currentMember(req);
  if (!member) {
    res.status(401).json({ message: tMsg(req, "Giriş yapmanız gerekiyor.", "You need to log in.") });
    return null;
  }
  return member;
}

function requireAdmin(req: Request, res: Response) {
  const member = requireMember(req, res);
  if (!member) return null;
  if (!member.isAdmin) {
    res.status(403).json({ message: tMsg(req, "Bu sayfa yalnızca yöneticiler içindir.", "This page is for administrators only.") });
    return null;
  }
  return member;
}

function fail(res: Response, err: unknown) {
  const status = typeof err === "object" && err && "status" in err ? Number((err as { status: number }).status) : 500;
  const message = err instanceof Error ? err.message : "Something went wrong.";
  res.status(status || 500).json({ message });
}

export function registerSocialRoutes(app: Express) {
  app.get("/api/social/me", (req, res) => {
    const member = currentMember(req);
    if (!member) return res.json({ member: null, unread: 0 });
    res.json({ member: store.toPublicMember(member, member.id), unread: store.unreadCount(member.id) });
  });

  app.post("/api/social/login", (req, res) => {
    try {
      const identifier = String(req.body?.username || req.body?.email || "").trim();
      const password = String(req.body?.password || "");
      const member = store.login(identifier, password);
      if (!member) return res.status(401).json({ message: String(req.body?.locale) === "en" ? "Wrong username or password." : "Kullanıcı adı veya şifre yanlış." });
      setSessionCookie(req, res, store.createSession(member.id));
      res.json({ member: store.toPublicMember(member, member.id) });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/register", (req, res) => {
    try {
      const member = store.registerMember({
        username: String(req.body?.username || ""),
        email: String(req.body?.email || ""),
        password: String(req.body?.password || ""),
        name: String(req.body?.name || ""),
        city: String(req.body?.city || ""),
        dogName: String(req.body?.dogName || ""),
        locale: String(req.body?.locale || "tr"),
      });
      setSessionCookie(req, res, store.createSession(member.id));
      res.status(201).json({ member: store.toPublicMember(member, member.id) });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/logout", (req, res) => {
    store.destroySession(readCookie(req, COOKIE));
    clearSessionCookie(req, res);
    res.json({ ok: true });
  });

  app.patch("/api/social/me", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      const updated = store.updateProfile(member.id, {
        name: req.body?.name,
        city: req.body?.city,
        dogName: req.body?.dogName,
        avatar: req.body?.avatar,
        bio: req.body?.bio,
        locale: req.body?.locale,
      });
      res.json({ member: store.toPublicMember(updated, updated.id) });
    } catch (err) {
      fail(res, err);
    }
  });

  app.get("/api/social/feed", (req, res) => {
    const member = currentMember(req);
    res.json({ posts: store.listFeed(member?.id), stories: store.listStories(member?.id), topics: store.listForum() });
  });

  app.get("/api/social/stories", (req, res) => {
    res.json({ stories: store.listStories(currentMember(req)?.id) });
  });

  app.get("/api/social/photos", (_req, res) => {
    res.json({ photos: SOCIAL_PHOTOS });
  });

  app.get("/api/social/posts/:id", (req, res) => {
    const data = store.getPost(req.params.id, currentMember(req)?.id);
    if (!data) return res.status(404).json({ message: tMsg(req, "Gönderi bulunamadı.", "Post not found.") });
    res.json(data);
  });

  app.post("/api/social/posts", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      const post = store.createPost(member.id, String(req.body?.caption || ""), String(req.body?.image || SOCIAL_PHOTOS[0]));
      res.status(201).json({ post });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/posts/:id/like", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      res.json({ post: store.toggleLike(req.params.id, member.id) });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/posts/:id/save", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      res.json({ post: store.toggleSave(req.params.id, member.id) });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/posts/:id/comments", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      const comment = store.addComment(req.params.id, member.id, String(req.body?.body || ""));
      res.status(201).json({ comment });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/posts/:id/report", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      const report = store.createReport(member.id, "post", req.params.id, String(req.body?.reason || ""));
      res.status(201).json({ report });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/members/:username/follow", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      res.json({ member: store.toggleFollow(req.params.username, member.id) });
    } catch (err) {
      fail(res, err);
    }
  });

  app.get("/api/social/members/:username", (req, res) => {
    const data = store.getMemberProfile(req.params.username, currentMember(req)?.id);
    if (!data) return res.status(404).json({ message: tMsg(req, "Üye bulunamadı.", "Member not found.") });
    res.json(data);
  });

  app.get("/api/social/slugs", (_req, res) => {
    res.json({ slugs: store.listProfileSlugs() });
  });

  app.get("/api/social/slug/:slug", (req, res) => {
    const data = store.getMemberBySlug(req.params.slug, currentMember(req)?.id);
    if (!data) return res.status(404).json({ message: tMsg(req, "Üye bulunamadı.", "Member not found.") });
    res.json(data);
  });

  app.get("/api/social/me/saved", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    res.json({ posts: store.listSaved(member.id) });
  });

  app.get("/api/social/forum", (_req, res) => {
    res.json({ topics: store.listForum() });
  });

  app.get("/api/social/forum/:id", (req, res) => {
    const topic = store.getForumTopic(req.params.id, true);
    if (!topic) return res.status(404).json({ message: tMsg(req, "Konu bulunamadı.", "Topic not found.") });
    res.json({ topic });
  });

  app.post("/api/social/forum", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      const topic = store.createTopic(
        member.id,
        String(req.body?.title || ""),
        String(req.body?.body || ""),
        String(req.body?.tag || "Sohbet"),
      );
      res.status(201).json({ topic });
    } catch (err) {
      fail(res, err);
    }
  });

  app.post("/api/social/forum/:id/replies", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      const topic = store.addReply(req.params.id, member.id, String(req.body?.body || ""));
      res.status(201).json({ topic });
    } catch (err) {
      fail(res, err);
    }
  });

  app.get("/api/social/clubs", (req, res) => {
    res.json({ clubs: store.listClubs(currentMember(req)?.id) });
  });

  app.get("/api/social/clubs/:id", (req, res) => {
    const data = store.getClub(req.params.id, currentMember(req)?.id);
    if (!data) return res.status(404).json({ message: tMsg(req, "Kulüp bulunamadı.", "Club not found.") });
    res.json(data);
  });

  app.post("/api/social/clubs/:id/join", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    try {
      res.json(store.toggleClub(req.params.id, member.id));
    } catch (err) {
      fail(res, err);
    }
  });

  app.get("/api/social/notifications", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    res.json({ notifications: store.listNotifications(member.id), unread: store.unreadCount(member.id) });
  });

  app.post("/api/social/notifications/read", (req, res) => {
    const member = requireMember(req, res);
    if (!member) return;
    store.markNotificationsRead(member.id);
    res.json({ ok: true, unread: 0 });
  });

  app.get("/api/social/search", (req, res) => {
    const q = String(req.query.q || "");
    res.json(store.searchAll(q, currentMember(req)?.id));
  });

  app.get("/api/social/admin/overview", (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json(store.adminOverview());
  });

  app.get("/api/social/admin/users", (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ users: store.adminUsers() });
  });

  app.get("/api/social/admin/posts", (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ posts: store.adminPosts() });
  });

  app.get("/api/social/admin/comments", (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ comments: store.adminComments() });
  });

  app.get("/api/social/admin/topics", (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ topics: store.adminTopics() });
  });

  app.get("/api/social/admin/reports", (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ reports: store.adminReports() });
  });

  app.post("/api/social/admin/posts/:id/hide", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.hidePost(req.params.id, req.body?.hidden !== false);
    res.json({ ok: true });
  });

  app.delete("/api/social/admin/posts/:id", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.deletePost(req.params.id);
    res.json({ ok: true });
  });

  app.post("/api/social/admin/comments/:id/hide", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.hideComment(req.params.id, req.body?.hidden !== false);
    res.json({ ok: true });
  });

  app.delete("/api/social/admin/comments/:id", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.deleteComment(req.params.id);
    res.json({ ok: true });
  });

  app.post("/api/social/admin/topics/:id/hide", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.hideTopic(req.params.id, req.body?.hidden !== false);
    res.json({ ok: true });
  });

  app.delete("/api/social/admin/topics/:id", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.deleteTopic(req.params.id);
    res.json({ ok: true });
  });

  app.post("/api/social/admin/reports/:id/resolve", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.resolveReport(req.params.id, String(req.body?.status || "resolved"));
    res.json({ ok: true });
  });

  app.post("/api/social/admin/replies/:id/hide", (req, res) => {
    if (!requireAdmin(req, res)) return;
    store.hideReply(req.params.id, req.body?.hidden !== false);
    res.json({ ok: true });
  });

  void ((_req: Request, _res: Response, _next: NextFunction) => undefined);
}
