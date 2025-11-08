import Image from "next/image";
import Link from "next/link";
import { AiFillApple, AiOutlineGoogle } from "react-icons/ai";

export const metadata = {
  title: "Cirqlate | Landing",
  description: "Abadikan moment-mu dan bagikan ke seluruh dunia bersama Cirqulate.",
};

export default function LandingPage() {
  return (
    <main className="flex min-h-screen bg-black text-zinc-200">
      <section className="hidden flex-1 items-center justify-center border-r border-zinc-800 bg-black lg:flex">
        <Image
          src="/logo.svg"
          alt="Cirqlate logo"
          width={320}
          height={320}
          priority
          className="h-auto w-72 max-w-full brightness-0 invert"
        />
      </section>

      <section className="flex w-full items-center justify-center px-6 py-12 lg:max-w-md lg:px-12">
        <div className="w-full max-w-sm space-y-8">
          <Image
            src="/logo.svg"
            alt="Cirqlate mini logo"
            width={56}
            height={56}
            className="h-12 w-12 brightness-0 invert"
          />

          <header className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Abadikan Moment-mu dan Bagikan ke Seluruh Dunia.
            </h1>
            <h2 className="text-xl font-semibold text-zinc-400 sm:text-2xl">
              Bergabunglah dengan Cirqlate sekarang.
            </h2>
          </header>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-800 px-5 py-3 text-base font-semibold transition-colors hover:bg-zinc-900"
            >
              <AiOutlineGoogle className="w-5 h-5" />
              <span>Daftar dengan Google</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-800 px-5 py-3 text-base font-semibold transition-colors hover:bg-zinc-900"
            >
              <AiFillApple className="w-5 h-5" />
              <span>Daftar dengan Apple</span>
            </button>

            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="h-px flex-1 bg-zinc-800" aria-hidden />
              <span>atau</span>
              <span className="h-px flex-1 bg-zinc-800" aria-hidden />
            </div>

            <Link
              href="/sign-up"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-sky-500 px-5 py-3 text-base font-semibold text-black transition-colors hover:bg-sky-400"
            >
              Buat Akun
            </Link>

            <p className="text-xs leading-relaxed text-zinc-500">
              Dengan mendaftar, Anda menyetujui {" "}
              <Link href="/terms" className="text-sky-500 hover:underline">
                Syarat Layanan
              </Link>{" "}
              dan {" "}
              <Link href="#" className="text-sky-500 hover:underline">
                Kebijakan Privasi
              </Link>{" "}
              kami.
            </p>

            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-semibold">Sudah punya akun?</h3>
              <Link
                href="/sign-in"
                className="flex w-full items-center justify-center gap-3 rounded-full border border-sky-500 px-5 py-3 text-base font-semibold text-sky-500 transition-colors hover:bg-sky-500/10"
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
