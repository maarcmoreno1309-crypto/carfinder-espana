"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = typeof window !== "undefined" ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
) : null;
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Rellena todos los campos"); return; }
    setLoading(true); setError(""); setMensaje("");
    try {
      if (modo === "registro") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMensaje("¡Cuenta creada! Revisa tu email para confirmarla.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  return (
    <main style={S.main}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <nav style={S.nav}>
        <a href="/" style={S.logo}><span style={S.logoAccent}>Car</span>Finder</a>
      </nav>

      <div style={S.wrap}>
        <div style={S.card}>
          <h1 style={S.title}>{modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h1>
          <p style={S.sub}>{modo === "login" ? "Accede a tus alertas y búsquedas guardadas" : "Gratis · Sin tarjeta · Sin trampa"}</p>

          <button onClick={handleGoogle} style={S.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>

          <div style={S.divider}><span style={S.dividerText}>o con email</span></div>

          <label style={S.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={S.input} />

          <label style={S.label}>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={S.input} onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {error && <p style={S.error}>{error}</p>}
          {mensaje && <p style={S.success}>{mensaje}</p>}

          <button onClick={handleSubmit} disabled={loading} style={S.btn}>
            {loading ? "Cargando…" : modo === "login" ? "Entrar →" : "Crear cuenta →"}
          </button>

          <p style={S.toggle}>
            {modo === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            <span onClick={() => { setModo(modo === "login" ? "registro" : "login"); setError(""); setMensaje(""); }} style={S.toggleLink}>
              {modo === "login" ? " Regístrate" : " Inicia sesión"}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}

const A = "#FF6B00";
const S = {
  main: { minHeight:"100vh", background:"#050505", color:"#F5F5F5", fontFamily:"'Inter', sans-serif" },
  nav: { borderBottom:"1px solid #1A1A1A", padding:"0 1.5rem", height:56, display:"flex", alignItems:"center" },
  logo: { fontWeight:800, fontSize:18, textDecoration:"none", color:"#F5F5F5" },
  logoAccent: { color:A },
  wrap: { display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 56px)", padding:"2rem 1.5rem" },
  card: { background:"#0D0D0D", border:"1px solid #1A1A1A", borderRadius:20, padding:"2.5rem", width:"100%", maxWidth:420 },
  title: { fontWeight:800, fontSize:24, letterSpacing:"-0.02em", marginBottom:6 },
  sub: { fontSize:14, color:"#666", marginBottom:"1.75rem" },
  googleBtn: { width:"100%", background:"#111", border:"1px solid #1A1A1A", borderRadius:10, padding:"12px", fontSize:14, fontWeight:500, color:"#F5F5F5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:"1.5rem", fontFamily:"'Inter', sans-serif" },
  divider: { position:"relative", textAlign:"center", marginBottom:"1.5rem", borderTop:"1px solid #1A1A1A" },
  dividerText: { position:"relative", top:-10, background:"#0D0D0D", padding:"0 12px", fontSize:12, color:"#444" },
  label: { fontSize:11, color:"#555", display:"block", marginBottom:5, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em" },
  input: { width:"100%", background:"#111", border:"1px solid #1A1A1A", borderRadius:10, padding:"12px 14px", color:"#F5F5F5", fontSize:14, outline:"none", fontFamily:"'Inter', sans-serif", boxSizing:"border-box", marginBottom:12 },
  error: { background:"#1A0500", border:`1px solid ${A}44`, borderRadius:8, padding:"10px 14px", fontSize:13, color:"#FF9966", marginBottom:12 },
  success: { background:"#051A05", border:"1px solid #22C55E44", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#22C55E", marginBottom:12 },
  btn: { width:"100%", background:A, color:"#000", border:"none", borderRadius:10, padding:"14px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Inter', sans-serif", marginBottom:"1.25rem" },
  toggle: { textAlign:"center", fontSize:13, color:"#555" },
  toggleLink: { color:A, cursor:"pointer", fontWeight:500 },
};
