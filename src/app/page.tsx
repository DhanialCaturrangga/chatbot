import Image from "next/image";
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col items-center gap-10 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10 sm:flex-row sm:items-start sm:p-16">
        
        {/* Bagian Foto Profil */}
        <div className="shrink-0">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-zinc-100 shadow-sm dark:border-zinc-800 sm:h-48 sm:w-48">
            {/* Placeholder Image: Ganti src dengan foto asli kamu, misal '/me.jpg' */}
            <Image
              src="/Daniel.jpg" 
              alt="Foto Muhammad Dhanial Caturrangga"
              fill
              className="object-cover bg-zinc-200 dark:bg-zinc-800"
              priority
            />
          </div>
        </div>

        {/* Bagian Informasi Diri */}
        <div className="flex flex-col text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Muhammad Dhanial Caturrangga
          </h1>
          
          <h2 className="mt-2 text-lg font-medium text-indigo-600 dark:text-indigo-400">
            Web Developer & Creative Thinker
          </h2>

          <p className="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Halo, saya Dhanial. Saya adalah seorang pegiat teknologi yang berfokus pada pengembangan web modern dan antarmuka pengguna yang intuitif. 
            Saya senang mengeksplorasi teknologi baru seperti Next.js dan Tailwind CSS untuk menciptakan solusi digital yang efisien. 
            Selain _coding_, saya juga tertarik pada dunia desain dan inovasi kreatif.
          </p>

          {/* Bagian Tombol Link (Opsional) */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:justify-start">
            <a
              href="#"
              className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Hubungi Saya
            </a>
            <a
              href="#"
              className="rounded-full border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Lihat Projek
            </a>
          </div>
          {/* Chat Widget */}
          <ChatWidget />
        </div>

      </main>
    </div>
  );
}