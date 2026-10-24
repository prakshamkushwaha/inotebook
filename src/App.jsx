import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Clock3,
  FileText, Filter, FolderHeart, LogOut, Menu, Plus, Search, ShieldCheck,
  Sparkles, Tag, Trash2, X, Pencil, NotebookPen, LockKeyhole, Mail, UserRound
} from "lucide-react";
import { CTASection } from "@/components/blocks/cta-with-rectangle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const initialForm = { title: "", description: "", tag: "Personal" };
const prettyDate = (date) => {
  if (!date) return "Just now";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "Recently" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(parsed);
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("inotebook_token") || "");
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState("All notes");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const refreshNotes = useCallback(async (authToken) => {
    setLoading(true);
    try {
      const result = await api.notes(authToken);
      setNotes(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load notes.";
      if (message.toLowerCase().includes("session") || message.toLowerCase().includes("sign in")) {
        localStorage.removeItem("inotebook_token");
        setToken("");
        setUser(null);
      }
      setNotice(message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
  }, []);

  useEffect(() => {
    if (!token) { setUser(null); setNotes([]); return; }
    api.me(token).then(({ user: current }) => {
      setUser(current);
      return refreshNotes(token);
    }).catch(() => {
      localStorage.removeItem("inotebook_token");
      setToken("");
      setUser(null);
    });
  }, [token, refreshNotes]);

  const tags = useMemo(() => ["All notes", ...Array.from(new Set(notes.map(n => n.tag || "General"))).sort()], [notes]);
  const filteredNotes = useMemo(() => notes.filter(note => {
    const matchesText = `${note.title} ${note.description} ${note.tag}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (filterTag === "All notes" || (note.tag || "General") === filterTag);
  }), [notes, query, filterTag]);

  const openAuth = (mode) => {
    setAuthMode(mode); setAuthError(""); setAuthOpen(true); setMobileMenu(false);
  };
  const logout = () => {
    localStorage.removeItem("inotebook_token");
    setToken(""); setUser(null); setNotes([]); setNotice("You have been signed out.");
  };
  const handleAuth = async (event) => {
    event.preventDefault(); setAuthBusy(true); setAuthError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    try {
      const result = authMode === "signup"
        ? await api.signup(name, email, password)
        : await api.login(email, password);
      localStorage.setItem("inotebook_token", result.authToken);
      setToken(result.authToken); setUser(result.user); setAuthOpen(false);
      setNotice(authMode === "signup" ? "Your account is ready. Welcome to iNotebook!" : "Welcome back.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally { setAuthBusy(false); }
  };

  const openNewNote = () => {
    if (!token) { openAuth("login"); return; }
    setEditing(null); setForm(initialForm); setEditorOpen(true); setNotice("");
  };
  const openEdit = (note) => {
    setEditing(note);
    setForm({ title: note.title, description: note.description, tag: note.tag || "General" });
    setEditorOpen(true); setNotice("");
  };
  const saveNote = async (event) => {
    event.preventDefault();
    if (!token) { openAuth("login"); return; }
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), tag: form.tag.trim() || "General" };
      if (editing) {
        const updated = await api.updateNote(token, editing._id, payload);
        setNotes(old => old.map(note => note._id === updated._id ? updated : note));
        setNotice("Note updated successfully.");
      } else {
        const created = await api.createNote(token, payload);
        setNotes(old => [created, ...old]);
        setNotice("Your note has been saved.");
      }
      setEditorOpen(false); setEditing(null); setForm(initialForm);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save the note.");
    } finally { setSaving(false); }
  };
  const deleteNote = async (note) => {
    if (!token || !window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    try {
      await api.deleteNote(token, note._id);
      setNotes(old => old.filter(item => item._id !== note._id));
      setNotice("Note deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not delete note.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f7f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button onClick={() => { setQuery(""); setFilterTag("All notes"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-3 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-950 text-white shadow-sm"><NotebookPen size={20} /></span>
            <span><span className="block text-lg font-bold tracking-tight">iNotebook<span className="text-emerald-700">.</span></span><span className="hidden text-[11px] font-medium tracking-[.16em] text-slate-500 sm:block">YOUR SPACE TO THINK</span></span>
          </button>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#workspace" className="transition hover:text-emerald-800">Workspace</a>
            <a href="#how-it-works" className="transition hover:text-emerald-800">How it works</a>
            <a href="#about" className="transition hover:text-emerald-800">About</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            {user ? <>
              <span className="max-w-36 truncate text-sm text-slate-600">Hi, {user.name.split(" ")[0]}</span>
              <Button variant="outline" size="sm" onClick={logout}><LogOut size={15} /> Sign out</Button>
            </> : <>
              <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>Log in</Button>
              <Button size="sm" onClick={() => openAuth("signup")}>Create account <ArrowRight size={15} /></Button>
            </>}
          </div>
          <button className="rounded-xl p-2 md:hidden" aria-label="Toggle menu" onClick={() => setMobileMenu(v => !v)}>{mobileMenu ? <X /> : <Menu />}</button>
        </div>
        {mobileMenu && <div className="border-t border-stone-200 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm"><a href="#workspace" onClick={() => setMobileMenu(false)}>Workspace</a><a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a><a href="#about" onClick={() => setMobileMenu(false)}>About</a>
          {user ? <button onClick={logout} className="text-left">Sign out</button> : <div className="flex gap-2"><Button variant="outline" onClick={() => openAuth("login")}>Log in</Button><Button onClick={() => openAuth("signup")}>Create account</Button></div>}</div>
        </div>}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-emerald-100/70 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-28 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
            <div className="animate-fade-in-up">
              <Badge variant="outline" className="mb-6 border-emerald-200 bg-white/80 text-emerald-900"><Sparkles size={13} /> A calmer way to capture ideas</Badge>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-.055em] sm:text-6xl lg:text-7xl">Make room for<br /><span className="font-serif italic font-medium text-emerald-800">good thinking.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">Your notes, plans, and passing ideas deserve a home. Capture what matters, find it when you need it, and keep your mind clear.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={user ? openNewNote : () => openAuth("signup")}>{user ? <><Plus size={18} /> Write a note</> : <>Get started free <ArrowRight size={18} /></>}</Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}>Explore workspace <ArrowDownRight size={18} /></Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-700" /> Private by account</span>
                <span className="flex items-center gap-1.5"><Check size={15} className="text-emerald-700" /> Auto-saved to database</span>
                <span className="flex items-center gap-1.5"><Clock3 size={15} className="text-emerald-700" /> Find it in seconds</span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg animate-scale-in">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 via-white to-amber-100 blur-xl" />
              <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-soft backdrop-blur sm:p-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><span className="text-xs font-medium text-slate-400">MY THOUGHTS / 03</span></div>
                <div className="py-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-emerald-800"><span className="h-px w-6 bg-emerald-700" /> Monday intentions</div>
                  <h3 className="font-serif text-3xl leading-tight tracking-tight">Small steps, <em>real progress.</em></h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">A reminder that the best work begins with a little space to think, and the courage to start.</p>
                  <div className="mt-6 space-y-3">
                    {[["01","Write down the idea"],["02","Break it into small tasks"],["03","Come back tomorrow"]].map(([num, text]) => <div key={num} className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-xs font-semibold text-emerald-800 shadow-sm">{num}</span><span className="text-sm font-medium text-slate-700">{text}</span><Check size={15} className="ml-auto text-emerald-700" /></div>)}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-stone-100 pt-4"><Badge variant="secondary"><Tag size={12} /> Personal</Badge><span className="text-xs text-slate-400">A little progress counts.</span></div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white bg-white p-3 shadow-soft sm:flex"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><FolderHeart size={19} /></span><span><strong className="block text-sm">Ideas, organized</strong><small className="text-slate-500">All in one quiet place</small></span></div>
            </div>
          </div>
        </section>

        <section id="workspace" className="scroll-mt-24 border-y border-stone-200/80 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><Badge variant="outline" className="mb-3">Your workspace</Badge><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A home for every thought.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Create, organize, and revisit the things you don't want to forget.</p></div>
              <Button onClick={user ? openNewNote : () => openAuth("login")}><Plus size={17} /> New note</Button>
            </div>

            {notice && <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={16} /></button></div>}
            {apiOnline === false && <div role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">The API is not reachable at {import.meta.env.VITE_API_URL || "http://localhost:5000"}. Start the backend and check its environment settings.</div>}

            {!user ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
                <div className="rounded-[1.75rem] border border-stone-200 bg-white p-7 sm:p-10">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-900"><LockKeyhole size={22} /></div>
                  <h3 className="mt-5 text-2xl font-semibold">Your notes, your space.</h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">Sign in to see your saved notes. Each account only sees its own notes, securely stored in the database.</p>
                  <div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => openAuth("login")}>Log in to your notes</Button><Button variant="outline" onClick={() => openAuth("signup")}>Create an account</Button></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {[{icon: FileText, title:"Capture", text:"Save ideas, class notes, and reminders in seconds."},{icon: Search, title:"Find", text:"Search across titles, descriptions, and tags."}].map(item => <div key={item.title} className="flex gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-stone-100"><item.icon size={19} /></span><div><h4 className="font-semibold">{item.title}</h4><p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p></div></div>)}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  {[{label:"Total notes", value: notes.length, icon: BookOpen},{label:"Categories", value: Math.max(0, tags.length - 1), icon: Tag},{label:"Showing", value: filteredNotes.length, icon: Filter}].map(item => <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-900"><item.icon size={19} /></span><div><p className="text-xs font-medium text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{item.value}</p></div></div>)}
                </div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  <label className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your notes..." className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" /></label>
                  <label className="relative"><Filter size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-stone-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-emerald-700 sm:min-w-44">{tags.map(tag => <option key={tag}>{tag}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" /></label>
                </div>
                {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="skeleton h-48 rounded-2xl" /><div className="skeleton h-48 rounded-2xl" /><div className="skeleton h-48 rounded-2xl" /></div> :
                  filteredNotes.length === 0 ? <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 px-6 py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-slate-500"><NotebookPen size={24} /></span><h3 className="mt-4 text-lg font-semibold">{query || filterTag !== "All notes" ? "No matching notes" : "Your page is still blank"}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{query || filterTag !== "All notes" ? "Try a different search or category." : "Start with a thought, a plan, or something you want to remember."}</p>{!query && filterTag === "All notes" && <Button className="mt-5" onClick={openNewNote}><Plus size={16} /> Create your first note</Button>}</div> :
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredNotes.map((note, index) => <article key={note._id} className="group flex min-h-56 flex-col rounded-[1.5rem] border border-stone-200/90 bg-white p-5 shadow-[0_4px_20px_-18px_rgba(15,23,42,.35)] transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-soft" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-start justify-between gap-3"><Badge variant="secondary" className="max-w-[70%] truncate"><Tag size={12} />{note.tag || "General"}</Badge><span className="shrink-0 text-xs text-slate-400">{prettyDate(note.updatedAt || note.date || note.createdAt)}</span></div>
                      <h3 className="mt-4 break-words text-lg font-semibold tracking-tight">{note.title}</h3><p className="mt-2 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">{note.description}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4"><span className="text-xs text-slate-400">Saved to your space</span><div className="flex gap-1 opacity-100 transition sm:opacity-70 sm:group-hover:opacity-100"><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${note.title}`} onClick={() => openEdit(note)}><Pencil size={15} /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete ${note.title}`} onClick={() => deleteNote(note)}><Trash2 size={15} /></Button></div></div>
                    </article>)}
                  </div>}
              </>
            )}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center"><Badge variant="outline" className="mb-4">Simple by design</Badge><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Less organizing. More thinking.</h2><p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">A small, reliable workflow that helps your ideas stay useful.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[{number:"01",title:"Capture the thought",text:"Write a title, add the detail, and give it a tag so it is easy to find later.",icon:NotebookPen},{number:"02",title:"Keep it organized",text:"Search your notes or filter by category whenever you need a reminder.",icon:Search},{number:"03",title:"Return and refine",text:"Edit notes as your plans evolve. Delete the ones you no longer need.",icon:CircleHelp}].map(item => <div key={item.number} className="rounded-[1.75rem] border border-stone-200 bg-white p-7"><div className="flex items-center justify-between"><span className="font-serif text-3xl italic text-emerald-800">{item.number}</span><span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100"><item.icon size={19} /></span></div><h3 className="mt-7 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{item.text}</p></div>)}
          </div>
        </section>

        <section id="about" className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <CTASection badge={{ text: "Your next good idea starts here" }} title="Give your thoughts a place to grow." description="Create your free account and start building a notebook that works the way you think." action={{ text: user ? "Write a note" : "Create your account", href: "#workspace" }} onAction={() => user ? openNewNote() : openAuth("signup")} />
          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center"><p>© {new Date().getFullYear()} iNotebook. Made for curious minds.</p><div className="flex flex-wrap gap-4"><span className="flex items-center gap-1"><ShieldCheck size={13} /> Account-protected notes</span><span className="flex items-center gap-1"><Mail size={13} /> Simple by design</span></div></div>
        </section>
      </main>

      {authOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}>
        <div className="relative my-auto w-full max-w-md animate-scale-in rounded-[1.75rem] border border-white/70 bg-[#fffefa] p-6 shadow-2xl sm:p-8">
          <button onClick={() => setAuthOpen(false)} aria-label="Close dialog" className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-stone-100"><X size={18} /></button>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-950 text-white"><NotebookPen size={21} /></div>
          <h2 id="auth-title" className="mt-5 text-2xl font-semibold tracking-tight">{authMode === "login" ? "Welcome back." : "Make space for ideas."}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{authMode === "login" ? "Sign in to continue to your notes." : "Create an account to keep your notes private and in sync."}</p>
          <form className="mt-6 space-y-4" onSubmit={handleAuth}>
            {authMode === "signup" && <label className="block text-sm font-medium">Full name<div className="relative mt-2"><UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your name" className="field pl-10" /></div></label>}
            <label className="block text-sm font-medium">Email address<div className="relative mt-2"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input name="email" required type="email" autoComplete="email" placeholder="you@example.com" className="field pl-10" /></div></label>
            <label className="block text-sm font-medium">Password<div className="relative mt-2"><LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input name="password" required minLength={6} type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} placeholder="At least 6 characters" className="field pl-10" /></div></label>
            {authError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{authError}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={authBusy}>{authBusy ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"}<ArrowRight size={16} /></Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">{authMode === "login" ? "New to iNotebook?" : "Already have an account?"} <button className="font-semibold text-emerald-800 hover:underline" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>{authMode === "login" ? "Create an account" : "Log in"}</button></p>
        </div>
      </div>}

      {editorOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="note-editor-title" onMouseDown={e => { if (e.target === e.currentTarget) setEditorOpen(false); }}>
        <div className="relative my-auto w-full max-w-xl rounded-[1.75rem] border border-white/70 bg-[#fffefa] p-6 shadow-2xl sm:p-8">
          <button onClick={() => setEditorOpen(false)} aria-label="Close editor" className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-stone-100"><X size={18} /></button>
          <Badge variant="outline" className="mb-4">{editing ? "Edit note" : "New note"}</Badge>
          <h2 id="note-editor-title" className="text-2xl font-semibold tracking-tight">{editing ? "Refine your thought." : "What’s on your mind?"}</h2>
          <p className="mt-2 text-sm text-slate-500">Your changes are saved to your account when you press save.</p>
          <form className="mt-6 space-y-4" onSubmit={saveNote}>
            <label className="block text-sm font-medium">Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required minLength={2} maxLength={120} placeholder="Give this note a clear title" className="field mt-2" autoFocus /></label>
            <label className="block text-sm font-medium">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required maxLength={12000} rows={5} placeholder="Write down the details..." className="field mt-2 resize-y" /></label>
            <label className="block text-sm font-medium">Category / tag<input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} maxLength={40} placeholder="Personal, Study, Work…" className="field mt-2" /></label>
            <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Save note"}<Check size={16} /></Button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}
