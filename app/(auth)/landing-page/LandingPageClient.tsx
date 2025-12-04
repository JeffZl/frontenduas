'use client';

import { useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { AiFillApple, AiOutlineGoogle } from "react-icons/ai";
import AOS from 'aos';
import 'aos/dist/aos.css';
import "./landing-page.css";

export default function LandingPageClient() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <main className="main">
      <section className="left-section" data-aos="fade-right">
        <Image
          src="/logo.svg"
          alt="Cirqlate logo"
          width={320}
          height={320}
          priority
          className="logo-large"
        />
      </section>

      <section className="right-section" data-aos="fade-left">
        <div className="content-container">
          <Image
            src="/logo.svg"
            alt="Cirqlate mini logo"
            width={56}
            height={56}
            className="logo-small"
          />

          <header className="header">
            <h1 className="heading">
              Abadikan Moment-mu dan Bagikan ke Seluruh Dunia.
            </h1>
            <h2 className="subheading">
              Bergabunglah dengan Cirqulate sekarang.
            </h2>
          </header>

          <div className="actions-container">
            <button
              type="button"
              className="button"
            >
              <AiOutlineGoogle className="icon" />
              <span>Daftar dengan Google</span>
            </button>

            <button
              type="button"
              className="button"
            >
              <AiFillApple className="icon" />
              <span>Daftar dengan Apple</span>
            </button>

            <div className="divider-container">
              <span className="divider-line" aria-hidden />
              <span>atau</span>
              <span className="divider-line" aria-hidden />
            </div>

            <Link
              href="/sign-up"
              className="primary-link"
            >
              Buat Akun
            </Link>

            <p className="terms-text">
              Dengan mendaftar, Anda menyetujui {" "}
              <Link href="/terms" className="link">
                Syarat Layanan
              </Link>{" "}
              dan {" "}
              <Link href="#" className="link">
                Kebijakan Privasi
              </Link>{" "}
              kami.
            </p>

            <div className="login-section">
              <h3 className="login-heading">Sudah punya akun?</h3>
              <Link
                href="/sign-in"
                className="secondary-link"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
