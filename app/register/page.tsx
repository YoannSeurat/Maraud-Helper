"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur d'inscription");
        setLoading(false);
        return;
      }

      // Rediriger vers le login si l'inscription est réussie
      router.push("/login");
    } catch (err) {
      setError("Erreur réseau");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light px-5">
      <div className="bg-bg-2 rounded-2xl shadow-lg p-10 w-fit border border-bg-3">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-main mb-2">Inscription</h1>
          <p className="text-sm text-text-secondary font-normal">
            Créez votre compte MaraudHelper
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary-50 text-secondary-600 px-4 py-3 rounded-lg mb-5 text-sm border-l-4 border-secondary-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">

          <div className={"flex flex-row gap-4"}>
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-text-main text-sm font-semibold tracking-wide">
                Nom complet
              </label>
              <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Entrez votre nom"
                  required
                  disabled={loading}
                  className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
              />
            </div>

            {/* Username Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-text-main text-sm font-semibold tracking-wide">
                Identifiant
              </label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choisissez un identifiant"
                  required
                  disabled={loading}
                  className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-text-main text-sm font-semibold tracking-wide">
              Email
            </label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez votre email"
                required
                disabled={loading}
                className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
            />
          </div>

          <div className={"flex flex-row gap-4 mb-6"}>
            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-text-main text-sm font-semibold tracking-wide">
                Mot de passe
              </label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  required
                  disabled={loading}
                  className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
              />
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-text-main text-sm font-semibold tracking-wide">
                Confirmer le mot de passe
              </label>
              <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  required
                  disabled={loading}
                  className="px-3.5 py-3 border-2 border-bg-3 rounded-lg text-sm text-text-main bg-bg transition-all duration-300 placeholder-text-secondary disabled:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:border-main-500 focus:bg-black focus:shadow-[0_0_0_3px_rgba(249,58,89,0.1)]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-gradient-main text-white rounded-lg text-sm font-semibold tracking-wide mt-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-main-500/30 hover:enabled:bg-gradient-main-hover active:enabled:translate-y-0"
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-bg-3 pt-5">
          <p className="text-text-secondary text-sm">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="text-main-500 no-underline font-semibold transition-colors duration-300 hover:text-main-600">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


