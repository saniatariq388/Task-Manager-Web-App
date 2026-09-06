import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-73px)] bg-gray-50 px-6 sm:px-10 lg:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-73px)]">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
            TASK MANAGER
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-md mx-auto lg:mx-0">
            Organize your day, track priorities, and never miss a deadline —
            all your tasks in one simple, focused workspace.
          </p>

          <Link
            href="/login"
            className="inline-block mt-8 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-semibold px-8 py-3 rounded-full transition"
          >
            GET STARTED
          </Link>

          <div className="flex justify-center lg:justify-start gap-2 mt-8">
            <span className="w-4 h-4 rounded-sm bg-emerald-700" />
            <span className="w-4 h-4 rounded-sm bg-emerald-500" />
            <span className="w-4 h-4 rounded-sm bg-emerald-300" />
          </div>
        </div>

        {/* Right: illustration */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 500 420"
            className="w-full max-w-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* floating calendar */}
            <rect x="330" y="30" width="90" height="80" rx="8" fill="#a7f3d0" />
            <rect x="330" y="30" width="90" height="20" rx="8" fill="#059669" />
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={340 + col * 18}
                  y={58 + row * 12}
                  width="10"
                  height="8"
                  rx="1.5"
                  fill="#059669"
                  opacity={0.6}
                />
              ))
            )}

            {/* floating clock */}
            <circle cx="450" cy="150" r="30" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
            <line x1="450" y1="150" x2="450" y2="132" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="450" y1="150" x2="462" y2="150" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* main dashboard card */}
            <rect x="60" y="120" width="330" height="260" rx="16" fill="#ffffff" stroke="#d1fae5" strokeWidth="2" />

            {/* header lines inside card */}
            <rect x="90" y="150" width="270" height="10" rx="5" fill="#a7f3d0" />
            <rect x="90" y="168" width="180" height="8" rx="4" fill="#d1fae5" />

            {/* pie chart */}
            <circle cx="150" cy="250" r="45" fill="#10b981" />
            <path d="M150 250 L150 205 A45 45 0 0 1 190 273 Z" fill="#34d399" />

            {/* bar chart */}
            <rect x="230" y="270" width="20" height="60" rx="3" fill="#059669" />
            <rect x="260" y="240" width="20" height="90" rx="3" fill="#10b981" />
            <rect x="290" y="255" width="20" height="75" rx="3" fill="#34d399" />
            <rect x="320" y="220" width="20" height="110" rx="3" fill="#6ee7b7" />

            {/* small person circle (simple avatar) sitting on card edge */}
            <circle cx="350" cy="130" r="16" fill="#059669" />
            <circle cx="350" cy="124" r="6" fill="#d1fae5" />

            {/* envelope / notification icon bottom right */}
            <rect x="360" y="320" width="70" height="50" rx="6" fill="#34d399" />
            <path d="M360 320 L395 348 L430 320" stroke="#ffffff" strokeWidth="3" fill="none" />

            {/* decorative leaves */}
            <path d="M40 200 Q20 180 30 150 Q55 165 40 200 Z" fill="#6ee7b7" />
            <path d="M420 260 Q445 245 440 215 Q412 225 420 260 Z" fill="#6ee7b7" />
          </svg>
        </div>
      </div>
    </section>
  );
}