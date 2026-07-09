export default function HorizonDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""}`}>
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="h-16 w-full"
        aria-hidden="true"
      >
        <path
          d="M0,60 C150,20 300,70 450,40 C600,10 750,55 900,35 C1000,22 1100,45 1200,30 L1200,80 L0,80 Z"
          fill="#5C7A52"
          opacity="0.35"
        />
        <path
          d="M0,70 C180,45 320,75 480,55 C640,35 780,65 960,50 C1050,42 1120,58 1200,50 L1200,80 L0,80 Z"
          fill="#3E5C3A"
          opacity="0.55"
        />
        <path
          d="M0,78 C220,66 400,80 600,70 C800,60 960,78 1200,68 L1200,80 L0,80 Z"
          fill="#152018"
        />
      </svg>
    </div>
  );
}
