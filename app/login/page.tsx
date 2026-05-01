"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur de connexion");
        setLoading(false);
        return;
      }

      // Rediriger vers la page d'accueil si la connexion est réussie
      router.push("/tableau-de-bord");
    } catch (err) {
      setError("Erreur réseau");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light px-5">
      <div className="bg-black rounded-2xl shadow-lg p-10 w-full max-w-md border border-bg-3">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-main mb-2">Connexion</h1>
          <p className="text-sm text-text-secondary font-normal">
            Accédez à votre compte MaraudHelper
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary-50 text-secondary-600 px-4 py-3 rounded-lg mb-5 text-sm border-l-4 border-secondary-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-6">
          {/* Username Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-text-main text-sm font-semibold tracking-wide">
              Email ou identifiant
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre email"
              required
              disabled={loading}
              className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-text-main text-sm font-semibold tracking-wide">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              disabled={loading}
              className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-gradient-main text-white rounded-lg text-sm font-semibold tracking-wide mt-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-main-500/30 hover:enabled:bg-gradient-main-hover active:enabled:translate-y-0"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-bg-3 pt-5">
          <p className="text-text-secondary text-sm">
            Pas encore de compte ?{" "}
            <a href="/register" className="text-main-500 no-underline font-semibold transition-colors duration-300 hover:text-main-600">
              S&apos;inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


