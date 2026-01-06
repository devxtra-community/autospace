"use client";
import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <div className="bg-white rounded-xl p-8 shadow-md">
      <h1 className="text-2xl font-bold mb-2">SignUp</h1>
      <p className="text-sm text-gray-500 mb-6">
        Please provide details below to create an account.
      </p>

      <form className="space-y-4">
        <input
          className="input"
          placeholder="Full Name"
          name="name"
          onChange={handleChange}
        />
        <input className="input" placeholder="Email Address" name="email" />
        <input className="input" placeholder="Phone Number" name="phone" />

        <input
          type="password"
          className="input"
          placeholder="Password"
          name="password"
        />
        <input
          type="password"
          className="input"
          placeholder="Confirm Password"
          name="confirmPassword"
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="agree" />I agree with{" "}
          <span className="text-yellow-500 cursor-pointer">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-yellow-500 cursor-pointer">Privacy Policy</span>
        </label>

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg"
        >
          Create Account
        </button>

        <p className="text-center text-sm">
          Have an account?{" "}
          <Link href="/login" className="text-yellow-500 font-semibold">
            SignIn
          </Link>
        </p>
      </form>
    </div>
  );
}
